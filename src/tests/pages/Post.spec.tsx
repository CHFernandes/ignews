import { render, screen } from '@testing-library/react';
import { getSession } from 'next-auth/react';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
    slug: 'my-new-post',
    title: 'My new post',
    content: '<p>Post excerpt</p>',
    updatedAt: 'August, 4'
}

jest.mock('next-auth/react');
jest.mock('../../services/prismic');

describe('Post page', () => {
    it('renders correctly', () => {
        render(<Post post={post} />);

        expect(screen.getByText("My new post")).toBeInTheDocument();
        expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    })

    it('redirects user if no subscription is found', async () => {
        const getSessionMocked = jest.mocked(getSession);

        getSessionMocked.mockResolvedValueOnce(null);

        const response = await getServerSideProps({
            req: {
                cookies: {},
            },
            params: {
                slug: 'my-new-post',
            }
        }as any);

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: '/'
                })
            })
        )
    });

    it('loads initial data', async () => {
        const getSessionMocked = jest.mocked(getSession);
        const getPrismicClientMocked = jest.mocked(getPrismicClient);

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        } as any);
        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        { type: 'heading', text: 'My new post'}
                    ],
                    content: [
                        { type: 'paragraph', text: 'Post content' },
                    ],
                },
                last_publication_date: '08-05-2022'
            })
        } as any);

        const response = await getServerSideProps({
            params: { slug: 'my-new-post' }
        } as any);

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: '<p>Post content</p>',
                        updatedAt: '05 de agosto de 2022'
                    }
                }
            })
        )
    })
})