import { ivedio } from "@/models/vedio";

export type VideoFormData = Omit<ivedio, '_id'>

type FetchOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    headers?: Record<string, string>
}

class ApiClient {
    private async fetch<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const defaultHeaders = {
            'Content-Type': "application/json",
            ...headers,
        }

        const response = await fetch(`/api${endpoint}`, {
            method,
            headers: defaultHeaders,
            body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json() as T;
    }

    async getVideos(): Promise<ivedio[]> {
        return this.fetch<ivedio[]>('/videos');
    }

    async createVideo(videoData: VideoFormData): Promise<ivedio> {
        return this.fetch<ivedio>('/videos', {
            method: 'POST',
            body: videoData,
        });
    }
}

export const apiClient = new ApiClient();