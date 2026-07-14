import { supabase } from '@/lib/supabase/client';
import type { PaysanduSchoolComment } from '@/types/paysandu-school-comment';

const SETUP_HINT =
  'Ejecutá supabase/paysandu_school_comments.sql en Supabase → SQL Editor y recargá la página.';

function mapCommentError(message: string): string {
  if (
    message.includes('does not exist') ||
    message.includes('Could not find the function') ||
    message.includes('schema cache')
  ) {
    return `Falta configurar comentarios de escuelas. ${SETUP_HINT}`;
  }
  if (message.includes('empty comment')) {
    return 'Escribí un comentario antes de guardar.';
  }
  if (message.includes('comment too long')) {
    return 'El comentario no puede superar 2000 caracteres.';
  }
  if (message.includes('not authorized')) {
    return 'No tenés permiso para gestionar comentarios de escuelas.';
  }
  return message;
}

export async function fetchPaysanduSchoolComments(
  schoolNumber: number,
): Promise<{ ok: true; comments: PaysanduSchoolComment[] } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc('get_paysandu_school_comments', {
    p_school_number: schoolNumber,
  });

  if (error) {
    return { ok: false, error: mapCommentError(error.message) };
  }

  return { ok: true, comments: (data ?? []) as PaysanduSchoolComment[] };
}

export async function createPaysanduSchoolComment(
  schoolNumber: number,
  body: string,
): Promise<{ ok: true; comment: PaysanduSchoolComment } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc('create_paysandu_school_comment', {
    p_school_number: schoolNumber,
    p_body: body,
  });

  if (error) {
    return { ok: false, error: mapCommentError(error.message) };
  }

  const row = data as {
    id: string;
    school_number: number;
    body: string;
    created_at: string;
    author_id: string;
  };

  return {
    ok: true,
    comment: {
      id: row.id,
      school_number: row.school_number,
      body: row.body,
      created_at: row.created_at,
      author_id: row.author_id,
      author_label: '',
    } satisfies PaysanduSchoolComment,
  };
}

export async function deletePaysanduSchoolComment(
  commentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc('delete_paysandu_school_comment', {
    p_comment_id: commentId,
  });

  if (error) {
    return { ok: false, error: mapCommentError(error.message) };
  }

  return { ok: true };
}
