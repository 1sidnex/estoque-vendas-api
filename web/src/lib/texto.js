// Ignora maiúsculas e acentos: "agua" encontra "Água mineral".
export function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// true quando todas as palavras da busca aparecem no texto ("cad 96" acha
// "Caderno 96 folhas"). Busca vazia combina com tudo.
export function contemTodas(texto, busca) {
  const alvo = normalizar(texto);
  return normalizar(busca)
    .split(/\s+/)
    .filter(Boolean)
    .every((palavra) => alvo.includes(palavra));
}
