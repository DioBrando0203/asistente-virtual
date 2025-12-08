import { NextRequest, NextResponse } from 'next/server';

// URL del backend (HTTP)
const BACKEND_URL = 'http://136.116.238.134/api';

// Handler para GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }
  } catch (error) {
    console.error('Error en proxy GET:', error);
    return NextResponse.json(
      { success: false, error: 'Error en el proxy al conectar con el backend' },
      { status: 500 }
    );
  }
}

// Handler para POST
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const contentType = request.headers.get('content-type') || '';
    let body;
    let fetchHeaders: HeadersInit = {};

    // Manejar FormData (para subida de archivos)
    if (contentType.includes('multipart/form-data') || request.body instanceof FormData) {
      body = await request.formData();
      // No establecer Content-Type para FormData, el navegador lo hace automáticamente
    } else {
      // Manejar JSON
      body = await request.text();
      fetchHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: fetchHeaders,
      body: body,
    });

    const responseContentType = response.headers.get('content-type') || '';

    if (responseContentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }
  } catch (error) {
    console.error('Error en proxy POST:', error);
    return NextResponse.json(
      { success: false, error: 'Error en el proxy al conectar con el backend' },
      { status: 500 }
    );
  }
}

// Handler para DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    let body;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.text();
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    const responseContentType = response.headers.get('content-type') || '';

    if (responseContentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }
  } catch (error) {
    console.error('Error en proxy DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Error en el proxy al conectar con el backend' },
      { status: 500 }
    );
  }
}

// Handler para PUT (por si lo necesitas después)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const body = await request.text();

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }
  } catch (error) {
    console.error('Error en proxy PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Error en el proxy al conectar con el backend' },
      { status: 500 }
    );
  }
}