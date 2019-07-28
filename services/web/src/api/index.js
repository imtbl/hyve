import axios from 'axios'

import config from '@/config'

let source

export default {
  fetchApiStatus () {
    return axios.get(config.apiUrl)
  },
  fetchInfo (token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.get(`${config.apiUrl}/info`, {
      headers: headers
    })
  },
  fetchUser (token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.get(`${config.apiUrl}/users`, {
      headers: headers
    })
  },
  createUser (body) {
    return axios.post(`${config.apiUrl}/users`, body)
  },
  updateUser (body, token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.put(`${config.apiUrl}/users`,
      body,
      { headers: headers }
    )
  },
  deleteUser (body, token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.delete(`${config.apiUrl}/users`, {
      headers: headers,
      data: body
    })
  },
  authorize (body) {
    return axios.post(`${config.apiUrl}/tokens`, body)
  },
  deauthorize (body, token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.delete(`${config.apiUrl}/tokens`, {
      headers: headers,
      data: body
    })
  },
  fetchTags (query, token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.get(`${config.apiUrl}/tags${query}`, {
      headers: headers
    })
  },
  autocompleteTag (body, token) {
    source = axios.CancelToken.source()

    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.post(`${config.apiUrl}/autocomplete-tag`,
      body,
      {
        headers: headers,
        cancelToken: source.token
      }
    )
  },
  cancelPendingTagAutocompleteRequest () {
    if (source) {
      source.cancel()
    }
  },
  fetchNamespaces (token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.get(`${config.apiUrl}/namespaces`, {
      headers: headers
    })
  },
  fetchFiles (query, token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.get(`${config.apiUrl}/files${query}`, {
      headers: headers
    })
  },
  fetchFile (id, token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.get(`${config.apiUrl}/files/${id}`, {
      headers: headers
    })
  },
  fetchMimeTypes (token) {
    const headers = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return axios.get(`${config.apiUrl}/mime-types`, {
      headers: headers
    })
  }
}
