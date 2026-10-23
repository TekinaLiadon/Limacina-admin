import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useApiResource } from '~/composables/useApiResource'
import { useLauncherMods } from '~/composables/useLauncherMods'
import { API_FORMAT_ERROR } from '~/api/types'
import { ApiEndpoint, endpointUrl } from '~/api/endpoints'

const API = 'http://api.test'

interface FetchCallOptions {
  method?: string
  headers: Record<string, string>
  body?: unknown
}

const fetchMock = vi.fn<(url: string, opts: FetchCallOptions) => Promise<unknown>>()
const navigateMock = vi.fn<(to: string) => unknown>()

vi.stubGlobal('$fetch', fetchMock)
vi.stubGlobal('navigateTo', navigateMock)
vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: API } }))
vi.stubGlobal('useApi', useApi)
vi.stubGlobal('useApiResource', useApiResource)
vi.stubGlobal('ref', ref)

const jeiMod = { name: 'jei-1.21.1.jar', size: 2_938_475 }

const fail = (statusCode: number, data?: Record<string, unknown>): Promise<never> =>
  Promise.reject(Object.assign(new Error(`Request failed with ${statusCode}`), { statusCode, data }))

describe('useLauncherMods', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    navigateMock.mockReset()
  })

  it('loads the mod list', async () => {
    fetchMock.mockResolvedValue({ mods: [jeiMod] })

    const { mods, loading, error, fetchMods } = useLauncherMods()
    await fetchMods()

    expect(mods.value).toStrictEqual([jeiMod])
    expect(error.value).toBe('')
    expect(loading.value).toBeFalsy()

    const [[url, opts]] = fetchMock.mock.calls
    expect(url).toBe(`${API}${ApiEndpoint.AdminLauncherMods}`)
    expect(opts.method).toBe('GET')
  })

  it('reports a format error on a malformed list', async () => {
    fetchMock.mockResolvedValue({ mods: 'nope' })

    const { mods, error, fetchMods } = useLauncherMods()
    await fetchMods()

    expect(error.value).toBe(API_FORMAT_ERROR)
    expect(mods.value).toStrictEqual([])
  })

  it('keeps an empty list when the response has no body', async () => {
    fetchMock.mockResolvedValue(null)

    const { mods, error, fetchMods } = useLauncherMods()
    await fetchMods()

    expect(error.value).toBe('')
    expect(mods.value).toStrictEqual([])
  })

  it('shows a server error when the list request fails', async () => {
    fetchMock.mockReturnValue(fail(500, { message: 'Нет доступа к папке модов' }))

    const { error, fetchMods } = useLauncherMods()
    await fetchMods()

    expect(error.value).toBe('Нет доступа к папке модов')
  })

  it('uploads files as multipart and refreshes the list', async () => {
    fetchMock.mockResolvedValueOnce({ uploaded: [jeiMod.name] })
    fetchMock.mockResolvedValueOnce({ mods: [jeiMod] })

    const { mods, uploading, uploadError, uploadSuccess, uploadMods } = useLauncherMods()
    await uploadMods([new File(['jar'], jeiMod.name)])

    expect(uploadSuccess.value).toBe('Моды загружены')
    expect(uploadError.value).toBe('')
    expect(uploading.value).toBeFalsy()
    expect(mods.value).toStrictEqual([jeiMod])

    const [[url, opts]] = fetchMock.mock.calls
    expect(url).toBe(`${API}${ApiEndpoint.AdminLauncherMods}`)
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)
    expect((opts.body as FormData).getAll('files')).toHaveLength(1)
  })

  it('does nothing when no files are selected', async () => {
    const { uploading, uploadMods } = useLauncherMods()
    await uploadMods([])

    expect(fetchMock).not.toHaveBeenCalled()
    expect(uploading.value).toBeFalsy()
  })

  it('surfaces an upload error without refreshing the list', async () => {
    fetchMock.mockReturnValue(fail(400, { message: 'Нужен хотя бы один файл мода' }))

    const { uploadError, uploadSuccess, uploadMods } = useLauncherMods()
    await uploadMods([new File(['jar'], 'mod.jar')])

    expect(uploadError.value).toBe('Нужен хотя бы один файл мода')
    expect(uploadSuccess.value).toBe('')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('deletes a mod by name and refreshes the list', async () => {
    fetchMock.mockResolvedValueOnce({ success: true })
    fetchMock.mockResolvedValueOnce({ mods: [] })

    const { mods, deleting, deleteError, deleteMod } = useLauncherMods()
    await deleteMod(jeiMod.name)

    expect(deleteError.value).toBe('')
    expect(deleting.value).toBe('')
    expect(mods.value).toStrictEqual([])

    const [[url, opts]] = fetchMock.mock.calls
    expect(url).toBe(`${API}${endpointUrl(ApiEndpoint.AdminLauncherMod, { name: jeiMod.name })}`)
    expect(opts.method).toBe('DELETE')
  })

  it('surfaces a delete error and keeps the list', async () => {
    fetchMock.mockReturnValue(fail(404, { message: 'Мод не найден: gone.jar' }))

    const { deleteError, deleting, deleteMod } = useLauncherMods()
    await deleteMod('gone.jar')

    expect(deleteError.value).toBe('Мод не найден: gone.jar')
    expect(deleting.value).toBe('')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
