export type WhatsappPreviewState = {
  titulo: string;
  texto: string;
  telefonoDestino?: string;
  claveGrupoWhatsapp?: string;
  modalidadGrupoWhatsapp?: string;
  referenciaGrupoWhatsapp?: string;
  enlaceGrupoWhatsapp?: string;
  mensajeGrupoCopiado?: boolean;
};

export type WhatsappGrupoApp = {
  clave_grupo: string;
  modalidad: string;
  referencia: string;
  nombre_grupo: string;
  enlace_whatsapp: string;
  actualizado_at: string | null;
};

export type WhatsappGroupContext = {
  clave: string;
  modalidad: 'BABY' | 'OCIO' | 'INTENSIVOS';
  referencia: string;
  nombre: string;
};
