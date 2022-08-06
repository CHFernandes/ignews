import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
    slug: 'my-new-post',
    title: 'My new post',
    content: '<p>Post excerpt</p>',
    updatedAt: 'August, 4'
}

jest.mock('next-auth/react');
jest.mock('next/router');
jest.mock('../../services/prismic');

describe('Post preview page', () => {
    it('renders correctly', () => {
        const useSessionMocked = jest.mocked(useSession);

        useSessionMocked.mockReturnValueOnce({ data: null, status: "unauthenticated" });

        render(<Post post={post} />);

        expect(screen.getByText("My new post")).toBeInTheDocument();
        expect(screen.getByText("Post excerpt")).toBeInTheDocument();
        expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
    })

    it('redirects user to full post when use is subscribed', async () => {
        const useSessionMocked = jest.mocked(useSession);
        const useRouterMocked = jest.mocked(useRouter);
        const pushMock = jest.fn();
        
        useSessionMocked.mockReturnValueOnce({
            data: {
                user: { name: "John Doe", email: "john.doe@example.com" },
                activeSubscription: 'fake-active-subscription',
                expires: "fake-expires",
            },
            status: "authenticated",
        });

        useRouterMocked.mockReturnValueOnce({
            push: pushMock,
        } as any)
        
        render(<Post post={post} />);

        expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post');
    });

    it('loads initial data', async () => {
        const getPrismicClientMocked = jest.mocked(getPrismicClient);

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

        const response = await getStaticProps({ params: { slug: 'my-new-post' }});

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