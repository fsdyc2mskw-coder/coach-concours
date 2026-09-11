const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
}

export class GoogleDriveClient {
  public constructor(private readonly accessToken: string) {}

  public async ensureFolder(name: string, parentId?: string): Promise<GoogleDriveFile> {
    const existing = await this.findFile(name, parentId, FOLDER_MIME);
    if (existing) {
      return existing;
    }
    const metadata: Record<string, unknown> = {
      name,
      mimeType: FOLDER_MIME
    };
    if (parentId) {
      metadata.parents = [parentId];
    }
    return this.api<GoogleDriveFile>(`${DRIVE_API}/files?fields=id,name,mimeType,parents,webViewLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });
  }

  public async findFile(
    name: string,
    parentId?: string,
    mimeType?: string
  ): Promise<GoogleDriveFile | null> {
    const clauses = [`name = '${escapeDriveQuery(name)}'`, 'trashed = false'];
    if (parentId) {
      clauses.push(`'${escapeDriveQuery(parentId)}' in parents`);
    }
    if (mimeType) {
      clauses.push(`mimeType = '${escapeDriveQuery(mimeType)}'`);
    }
    const params = new URLSearchParams({
      q: clauses.join(' and '),
      fields: 'files(id,name,mimeType,modifiedTime,parents,webViewLink)',
      orderBy: 'modifiedTime desc',
      pageSize: '10'
    });
    const result = await this.api<{ files: GoogleDriveFile[] }>(`${DRIVE_API}/files?${params.toString()}`);
    return result.files[0] ?? null;
  }

  public async getFile(fileId: string): Promise<GoogleDriveFile> {
    return this.api<GoogleDriveFile>(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,modifiedTime,parents,webViewLink`
    );
  }

  public async upsertTextFile(options: {
    name: string;
    content: string;
    mimeType: string;
    parentId: string;
    fileId?: string;
  }): Promise<GoogleDriveFile> {
    const file = options.fileId
      ? await this.getFile(options.fileId).catch(() => null)
      : await this.findFile(options.name, options.parentId);
    if (file) {
      await this.api(`${DRIVE_UPLOAD_API}/files/${encodeURIComponent(file.id)}?uploadType=media`, {
        method: 'PATCH',
        headers: { 'Content-Type': options.mimeType },
        body: options.content
      });
      return this.getFile(file.id);
    }
    return this.createMultipartFile({
      name: options.name,
      parentId: options.parentId,
      mimeType: options.mimeType,
      body: new Blob([options.content], { type: options.mimeType })
    });
  }

  public async createTextFileIfMissing(options: {
    name: string;
    content: string;
    mimeType: string;
    parentId: string;
  }): Promise<GoogleDriveFile> {
    const existing = await this.findFile(options.name, options.parentId);
    if (existing) {
      return existing;
    }
    return this.createMultipartFile({
      name: options.name,
      parentId: options.parentId,
      mimeType: options.mimeType,
      body: new Blob([options.content], { type: options.mimeType })
    });
  }

  public async uploadDataUrl(options: {
    name: string;
    dataUrl: string;
    parentId: string;
  }): Promise<GoogleDriveFile> {
    const response = await fetch(options.dataUrl);
    const blob = await response.blob();
    const existing = await this.findFile(options.name, options.parentId);
    if (existing) {
      await this.api(`${DRIVE_UPLOAD_API}/files/${encodeURIComponent(existing.id)}?uploadType=media`, {
        method: 'PATCH',
        headers: { 'Content-Type': blob.type || 'image/jpeg' },
        body: blob
      });
      return this.getFile(existing.id);
    }
    return this.createMultipartFile({
      name: options.name,
      parentId: options.parentId,
      mimeType: blob.type || 'image/jpeg',
      body: blob
    });
  }

  public async readTextFile(fileId: string): Promise<string> {
    const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    if (!response.ok) {
      throw await driveError(response);
    }
    return response.text();
  }

  private async createMultipartFile(options: {
    name: string;
    parentId: string;
    mimeType: string;
    body: Blob;
  }): Promise<GoogleDriveFile> {
    const boundary = `trailcoach_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
    const metadata = JSON.stringify({
      name: options.name,
      mimeType: options.mimeType,
      parents: [options.parentId]
    });
    const multipartBody = new Blob(
      [
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
        `--${boundary}\r\nContent-Type: ${options.mimeType}\r\n\r\n`,
        options.body,
        `\r\n--${boundary}--`
      ],
      { type: `multipart/related; boundary=${boundary}` }
    );
    return this.api<GoogleDriveFile>(
      `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,parents,webViewLink`,
      {
        method: 'POST',
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body: multipartBody
      }
    );
  }

  private async api<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...init.headers
      }
    });
    if (!response.ok) {
      throw await driveError(response);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}

function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function driveError(response: Response): Promise<Error> {
  let detail = '';
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    detail = body.error?.message ?? '';
  } catch {
    detail = await response.text().catch(() => '');
  }
  return new Error(`Google Drive ${response.status}${detail ? ` : ${detail}` : ''}`);
}
