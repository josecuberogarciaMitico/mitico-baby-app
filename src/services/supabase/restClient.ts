export type AccessTokenProvider = () => Promise<string>;

export type SupabaseRestClientOptions = {
  supabaseUrl: string;
  publishableKey: string;
  getAccessToken: AccessTokenProvider;
  fetcher?: typeof fetch;
};

export class SupabaseRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: unknown
  ) {
    super(message);
    this.name = 'SupabaseRequestError';
  }
}

async function readResponse<T>(
  response: Response,
  defaultMessage: string
): Promise<T> {
  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const data = payload as Record<string, unknown> | null;
    const message =
      typeof payload === 'string'
        ? payload
        : String(
            data?.message ||
              data?.error ||
              data?.hint ||
              data?.details ||
              text ||
              defaultMessage
          );
    throw new SupabaseRequestError(message, response.status, payload);
  }
  return payload as T;
}

export function createSupabaseRestClient(options: SupabaseRestClientOptions) {
  const baseUrl = options.supabaseUrl.replace(/\/$/, '');
  const fetcher = options.fetcher || fetch;

  async function authenticatedHeaders(json = false) {
    const accessToken = await options.getAccessToken();
    return {
      apikey: options.publishableKey,
      Authorization: `Bearer ${accessToken}`,
      ...(json ? { 'Content-Type': 'application/json' } : {}),
    };
  }

  async function query<T>(tableOrView: string, queryString: string): Promise<T[]> {
    const response = await fetcher(
      `${baseUrl}/rest/v1/${tableOrView}?${queryString}`,
      { headers: await authenticatedHeaders() }
    );
    return readResponse<T[]>(response, `No se pudo consultar ${tableOrView}.`);
  }

  async function rpcJson<T>(functionName: string, body: object): Promise<T> {
    const response = await fetcher(
      `${baseUrl}/rest/v1/rpc/${encodeURIComponent(functionName)}`,
      {
        method: 'POST',
        headers: await authenticatedHeaders(true),
        body: JSON.stringify(body),
      }
    );
    return readResponse<T>(response, `No se pudo ejecutar ${functionName}.`);
  }

  async function rpcRows<T>(functionName: string, body: object): Promise<T[]> {
    return rpcJson<T[]>(functionName, body);
  }

  async function rpcVoid(functionName: string, body: object): Promise<void> {
    await rpcJson<unknown>(functionName, body);
  }

  async function publicRpcJson<T>(
    functionName: string,
    body: object
  ): Promise<T> {
    const response = await fetcher(
      `${baseUrl}/rest/v1/rpc/${encodeURIComponent(functionName)}`,
      {
        method: 'POST',
        headers: {
          apikey: options.publishableKey,
          Authorization: `Bearer ${options.publishableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    return readResponse<T>(response, `No se pudo ejecutar ${functionName}.`);
  }

  async function edgeJson<T>(
    functionName: string,
    body: object,
    access: 'authenticated' | 'public' = 'authenticated'
  ): Promise<T> {
    const authorization =
      access === 'authenticated'
        ? await options.getAccessToken()
        : options.publishableKey;
    const response = await fetcher(
      `${baseUrl}/functions/v1/${encodeURIComponent(functionName)}`,
      {
        method: 'POST',
        headers: {
          apikey: options.publishableKey,
          Authorization: `Bearer ${authorization}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    return readResponse<T>(response, `No se pudo ejecutar ${functionName}.`);
  }

  return {
    query,
    rpcJson,
    rpcRows,
    rpcVoid,
    publicRpcJson,
    edgeJson,
  };
}

export type SupabaseRestClient = ReturnType<typeof createSupabaseRestClient>;
