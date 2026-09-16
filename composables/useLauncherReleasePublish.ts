import { ApiEndpoint } from '~/api/endpoints'
import type { LauncherReleasePublished } from '~/api/types'
import {
  UPDATER_PLATFORMS,
  buildReleaseFormData,
  validateReleaseForm,
  type ReleasePairForm,
} from '~/utils/updaterPlatforms'

export interface ReleaseUploadForm {
  version: string
  pairs: Record<string, ReleasePairForm>
}

const defaultPairs = (): Record<string, ReleasePairForm> =>
  Object.fromEntries(
    UPDATER_PLATFORMS.map((platform) => [platform.key, { artifact: null, signature: null }]),
  )

interface LauncherReleasePublishState {
  form: ReleaseUploadForm
  formError: ComputedRef<string>
  publishing: Ref<boolean>
  publishError: Ref<string>
  publishSuccess: Ref<string>
  publishRelease: (onPublished: () => void) => Promise<void>
}

export const useLauncherReleasePublish = (): LauncherReleasePublishState => {
  const { patch } = useApi()

  const form = reactive<ReleaseUploadForm>({ version: '', pairs: defaultPairs() })

  const publishing = ref(false)
  const publishError = ref('')
  const publishSuccess = ref('')

  const formError = computed(() => validateReleaseForm(form.version, form.pairs))

  const resetForm = (): void => {
    form.version = ''
    form.pairs = defaultPairs()
  }

  const publishRelease = async (onPublished: () => void): Promise<void> => {
    const invalid = validateReleaseForm(form.version, form.pairs)
    if (invalid) {
      publishError.value = invalid
      return
    }

    publishing.value = true
    publishError.value = ''
    publishSuccess.value = ''

    try {
      const res = await patch<LauncherReleasePublished>(
        ApiEndpoint.AdminLauncherRelease,
        buildReleaseFormData(form.version, form.pairs),
      )

      if (res.error.value) {
        publishError.value = res.error.value
      } else {
        const published = res.data.value?.published.length ?? 0
        publishSuccess.value =
          `Релиз ${res.data.value?.version ?? form.version} опубликован${ 
          published ? ` (платформ: ${published})` : ''}`
        resetForm()
        onPublished()
      }
    } finally {
      publishing.value = false
    }
  }

  return { form, formError, publishing, publishError, publishSuccess, publishRelease }
}
