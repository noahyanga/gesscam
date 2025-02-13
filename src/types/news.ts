// types/news.ts
export type NewsPost = {
  id: string;
  title: string;
  content: string;
  image: string;
  date: Date;
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
};
