import Etiqueta from '@/components/ui/Etiqueta';

const STATUS = {
  concluida: { rotulo: 'Concluída', tom: 'sucesso' },
  cancelada: { rotulo: 'Cancelada', tom: 'perigo' },
};

// Etiqueta com o status da venda (concluída ou cancelada).
export default function EtiquetaStatus({ status }) {
  return <Etiqueta tom={STATUS[status]?.tom}>{STATUS[status]?.rotulo || status}</Etiqueta>;
}
