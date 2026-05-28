export interface Poder {
    nome: string;
    forca: string;
}
export interface Pokemon {
    index: string;
    nome: string;
    imagem: string;
    tipos: string[];
    poderes: Poder[];
}