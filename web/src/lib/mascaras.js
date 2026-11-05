// Máscaras e validações de formato usadas nos formulários.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Aplica a máscara de CNPJ progressivamente: 00.000.000/0000-00.
export function mascararCnpj(valor) {
  const d = String(valor).replace(/\D/g, '').slice(0, 14);
  if (d.length > 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  if (d.length > 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  if (d.length > 5) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length > 2) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return d;
}

// Máscara de telefone: (00) 0000-0000 (fixo) ou (00) 00000-0000 (celular).
export function mascararTelefone(valor) {
  const d = String(valor).replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// CNPJ válido = 14 dígitos (mesmo critério de formato aceito pela API).
export function cnpjValido(valor) {
  return String(valor).replace(/\D/g, '').length === 14;
}

export function emailValido(valor) {
  return EMAIL_REGEX.test(String(valor).trim());
}
