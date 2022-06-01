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
    const body = response.headers.get('Content-Type').indexOf('application/json') !== -1  ?
      await response.json() :
      await response.text();

    if(response.status >= 400) {
      throw new Error(body?.error || body);
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
    const body = response.headers.get('Content-Type').indexOf('application/json') !== -1 ?
      await response.json() :
      await response.text();

    if(response.status >= 400) {
      throw new Error(body?.error || body);
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
    const body = response.headers.get('Content-Type').indexOf('application/json') !== -1 ?
      await response.json() :
      await response.text();

    if(response.status >= 400) {
      throw new Error(body?.error || body);
    }

    return true;
  }
}

export default Api;
