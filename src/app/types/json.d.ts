interface Recipe {
  id: number;
  title: string;
  slug: string;
  country: string;
  category: string[];
  img: { url: string; alt?: string };
  status: string;
  created_at?: string;
  updated_at?: string;
}

declare module "*.json" {
  const value: Recipe[];
  export default value;
}
