class Api {
  url = '';
  token;

  constructor(token) {
    this.token = token;
  }

  async get(path, {fields, filters, ...rest} = {}) {
    const params = new URLSearchParams({
      ...fields ? {fields: fields.join(',')} : {},
      ...filters ? {filters: filters.join(' and ')} : {},
      ...rest
    });
    const response = await fetch(
      `${this.url}${path}?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    if(!response.headers.get('Content-Type').includes('application/json')) {
      return null;
    }

    const body = await response.json();

    if(response.status >= 400) {
      console.log(body.error);

      return null;
    }

    return body;
  }

  async post(path, request) {
    const response = await fetch(
      `${this.url}${path}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }
    );

    if(!response.headers.get('Content-Type').includes('application/json')) {
      return null;
    }

    const body = await response.json();

    if(response.status >= 400) {
      console.log(body.error);

      return null;
    }

    return body;
  }

  async put(path, request) {
    const response = await fetch(
      `${this.url}${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }
    );

    if(!response.headers.get('Content-Type').includes('application/json')) {
      return null;
    }

    const body = await response.json();

    if(response.status >= 400) {
      console.log(body.error);

      return null;
    }

    return true;
  }
}

export default Api;
