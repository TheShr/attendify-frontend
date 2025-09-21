export const config = { matcher: [] };

export default function middleware() {
  return new Response(null, { status: 204 });
}

