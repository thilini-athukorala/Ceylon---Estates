import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} from '../services/propertyService'

describe('Property API Service Tests', () => {

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches all properties successfully', async () => {
    const properties = [{ _id: '1', title: 'House in Galle' }]

    fetch.mockResolvedValue({
      ok: true,
      json: async () => properties
    })

    const result = await getProperties()

    expect(result).toEqual(properties)
    expect(fetch).toHaveBeenCalledWith(
      '/api/properties'
    )
  })

  it('fetches a property by ID', async () => {
    const property = { _id: '1', title: 'Villa' }

    fetch.mockResolvedValue({
      ok: true,
      json: async () => property
    })

    const result = await getPropertyById('1')

    expect(result).toEqual(property)
    expect(fetch).toHaveBeenCalledWith(
      '/api/properties/1'
    )
  })

  it('creates a new property', async () => {
    const property = { title: 'New House', price: 10000000 }

    fetch.mockResolvedValue({
      ok: true,
      json: async () => property
    })

    const result = await createProperty(property)

    expect(result).toEqual(property)

    expect(fetch).toHaveBeenCalledWith(
      '/api/properties',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(property)
      })
    )
  })

  it('updates an existing property', async () => {
    const property = { title: 'Updated House' }

    fetch.mockResolvedValue({
      ok: true,
      json: async () => property
    })

    const result = await updateProperty('1', property)

    expect(result).toEqual(property)

    expect(fetch).toHaveBeenCalledWith(
      '/api/properties/1',
      expect.objectContaining({
        method: 'PUT'
      })
    )
  })

  it('deletes a property', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Deleted' })
    })

    const result = await deleteProperty('1')

    expect(result.message).toBe('Deleted')

    expect(fetch).toHaveBeenCalledWith(
      '/api/properties/1',
      expect.objectContaining({
        method: 'DELETE'
      })
    )
  })

  it('handles API errors', async () => {
    fetch.mockResolvedValue({
      ok: false
    })

    await expect(getProperties()).rejects.toThrow(
      'Failed to fetch properties'
    )
  })

})
