import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get latest session
    const { data: sessions, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (sessionError) throw sessionError;

    let sessionId = sessions?.[0]?.id;

    if (!sessionId) {
      // Create new session if none exists
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title: 'New Chat' })
        .select()
        .single();

      if (createError) throw createError;
      sessionId = newSession.id;
    }

    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    return NextResponse.json({ sessionId, messages: messages || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, content, sessionId } = await req.json();

    if (!content || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let targetSessionId = sessionId;

    if (!targetSessionId) {
      // Fallback: Get latest or create
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      targetSessionId = sessions?.[0]?.id;

      if (!targetSessionId) {
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ user_id: user.id, title: content.substring(0, 30) })
          .select()
          .single();
        targetSessionId = newSession?.id;
      }
    }

    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: targetSessionId,
        role,
        content,
        // user_id removed as it's not in schema
      })
      .select()
      .single();

    if (error) throw error;

    // Update session timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetSessionId);

    return NextResponse.json(message);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
