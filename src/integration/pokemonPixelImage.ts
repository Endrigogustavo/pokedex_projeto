const API_BASE_IMG_PIXEL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"

export function pixelSpriteUrl(index: string): string {
  const id = Number(index);
  return `${API_BASE_IMG_PIXEL}/${id}.png`;
}