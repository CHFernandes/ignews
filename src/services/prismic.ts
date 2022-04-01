import * as prismic from '@prismicio/client';

export function getPrismicClient(req?: unknown) {
    const prismicClient = prismic.createClient(process.env.PRISMIC_ENDPOINT);

    prismicClient.accessToken = process.env.PRISMIC_ACCESS_TOKEN;

    req && prismicClient.enableAutoPreviewsFromReq(req);


    return prismicClient;
}