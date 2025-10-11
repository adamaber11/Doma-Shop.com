import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type BrandPlaceholder = {
  id: string;
  name: string;
  logoUrl: string;
  logoHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
export const Brands: BrandPlaceholder[] = data.brands;
