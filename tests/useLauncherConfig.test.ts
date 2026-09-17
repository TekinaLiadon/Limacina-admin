import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, reactive } from 'vue'
import { useApi } from '~/composables/useApi'
import { useApiResource } from '~/composables/useApiResource'
import { useLauncherConfig } from '~/composables/useLauncherConfig'
import { API_FORMAT_ERROR, type LauncherConfig } from '~/api/types'
import { ApiEndpoint } from '~/api/endpoints'

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
vi.stubGlobal('reactive', reactive)

const validConfig: LauncherConfig = {
  projectName: 'limacina',
  mcVersion: '1.20.1',
  modLoader: 'fabric',
  loaderVersion: '0.15.11',
  jvmArgs: ['-Xmx4G', '-Xms2G'],
  minMemory: '2G',
  maxMemory: '4G',
  online: true,
}

const fail = (statusCode: number, data?: Record<string, unknown>): Promise<never> =>
  Promise.reject(Object.assign(new Error(`Request failed with ${statusCode}`), { statusCode, data }))

describe('useLauncherConfig', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    navigateMock.mockReset()
  })

  it('fills the form fields from a valid config', async () => {
    fetchMock.mockResolvedValue(validConfig)

    const { form, isNew, error, loading, fetchConfig } = useLauncherConfig()
    await fetchConfig()

    expect(isNew.value).toBeFalsy()
    expect(error.value).toBe('')
    expect(loading.value).toBeFalsy()
    expect(form.projectName).toBe('limacina')
    expect(form.mcVersion).toBe('1.20.1')
    expect(form.modLoader).toBe('fabric')
    expect(form.loaderVersion).toBe('0.15.11')
    expect(form.minMemory).toBe('2G')
    expect(form.maxMemory).toBe('4G')
  })

  it('joins jvmArgs with spaces and maps online', async () => {
    fetchMock.mockResolvedValue(validConfig)

    const { form, fetchConfig } = useLauncherConfig()
    await fetchConfig()

    expect(form.online).toBeTruthy()
    expect(form.jvmArgs).toBe('-Xmx4G -Xms2G')
  })

  it('switches to the create form on 404', async () => {
    fetchMock.mockReturnValue(fail(404, { message: 'Not found' }))

    const { form, isNew, error, fetchConfig } = useLauncherConfig()
    await fetchConfig()

    expect(isNew.value).toBeTruthy()
    expect(error.value).toBe('')
    expect(form.projectName).toBe('')
    expect(form.jvmArgs).toBe('')
    expect(form.online).toBeNull()
  })

  it('sets a format error instead of crashing on a malformed config', async () => {
    fetchMock.mockResolvedValue({ ...validConfig, jvmArgs: '-Xmx4G -Xms2G' })

    const { isNew, error, form, fetchConfig } = useLauncherConfig()
    await expect(fetchConfig()).resolves.toBeUndefined()

    expect(error.value).toBe(API_FORMAT_ERROR)
    expect(isNew.value).toBeFalsy()
    expect(form.jvmArgs).toBe('')
  })

  it('shows a server error on a failed request', async () => {
    fetchMock.mockReturnValue(fail(500, { message: 'Внутренняя ошибка' }))

    const { error, fetchConfig } = useLauncherConfig()
    await fetchConfig()

    expect(error.value).toBe('Внутренняя ошибка')
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('saves the form as a patch and reports an update', async () => {
    fetchMock.mockResolvedValue(validConfig)

    const { form, config, isNew, saving, saveError, saveSuccess, saveConfig } = useLauncherConfig()
    form.projectName = 'limacina'
    form.jvmArgs = '  -Xmx4G   -Xms2G  '
    await saveConfig()

    expect(saving.value).toBeFalsy()
    expect(saveError.value).toBe('')
    expect(saveSuccess.value).toBe('Конфиг обновлён')
    expect(isNew.value).toBeFalsy()
    expect(config.value).toStrictEqual(validConfig)

    const [[url, opts]] = fetchMock.mock.calls
    expect(url).toBe(`${API}${ApiEndpoint.AdminConfig}`)
    expect(opts.method).toBe('PATCH')
    expect(opts.body).toMatchObject({ projectName: 'limacina', jvmArgs: ['-Xmx4G', '-Xms2G'] })
  })

  it('reports a creation when saving a brand new config', async () => {
    fetchMock.mockReturnValue(fail(404, { message: 'Not found' }))

    const { isNew, saveSuccess, fetchConfig, saveConfig } = useLauncherConfig()
    await fetchConfig()
    expect(isNew.value).toBeTruthy()

    fetchMock.mockResolvedValue(validConfig)
    await saveConfig()

    expect(saveSuccess.value).toBe('Конфиг создан')
    expect(isNew.value).toBeFalsy()
  })

  it('surfaces a save error without reporting success', async () => {
    fetchMock.mockReturnValue(fail(500, { message: 'Сбой сохранения' }))

    const { saveError, saveSuccess, saveConfig } = useLauncherConfig()
    await saveConfig()

    expect(saveError.value).toBe('Сбой сохранения')
    expect(saveSuccess.value).toBe('')
  })

  it('reports success without a config when the response has no body', async () => {
    fetchMock.mockResolvedValue(null)

    const { config, saveSuccess, saveConfig } = useLauncherConfig()
    await saveConfig()

    expect(saveSuccess.value).toBe('Конфиг обновлён')
    expect(config.value).toBeNull()
  })
})
