import { describe, it, expect } from 'vitest'
import { isSafeUrl } from '../utils/url'

describe('isSafeUrl', () => {
  it('allows http and https urls', () => {
    expect(isSafeUrl('https://example.com/launcher/file.AppImage')).toBeTruthy()
    expect(isSafeUrl('http://localhost:3005/v1/launcher/file.exe')).toBeTruthy()
    expect(isSafeUrl('https://example.com:8443/a?b=c#d')).toBeTruthy()
  })

  it('rejects javascript scheme in any form', () => {
    const jsScheme = 'javascript'
    expect(isSafeUrl(`${jsScheme}:alert(1)`)).toBeFalsy()
    expect(isSafeUrl(`${jsScheme.toUpperCase()}:alert(1)`)).toBeFalsy()
    expect(isSafeUrl('java\tscript:alert(1)')).toBeFalsy()
    expect(isSafeUrl('java\nscript:alert(1)')).toBeFalsy()
    expect(isSafeUrl('  javascript:alert(1)')).toBeFalsy()
    expect(isSafeUrl('javascript&colon;alert(1)')).toBeFalsy()
  })

  it('rejects other dangerous schemes', () => {
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBeFalsy()
    expect(isSafeUrl('vbscript:msgbox(1)')).toBeFalsy()
    expect(isSafeUrl('file:///etc/passwd')).toBeFalsy()
  })

  it('rejects non-http schemes the panel does not link to', () => {
    expect(isSafeUrl('mailto:admin@example.com')).toBeFalsy()
    expect(isSafeUrl('ftp://example.com/file')).toBeFalsy()
  })

  it('rejects relative and malformed urls', () => {
    expect(isSafeUrl('/launcher/file.AppImage')).toBeFalsy()
    expect(isSafeUrl('example.com/file')).toBeFalsy()
    expect(isSafeUrl('')).toBeFalsy()
    expect(isSafeUrl('https://')).toBeFalsy()
  })

  it('rejects non-string values', () => {
    const absentUrl: unknown = undefined
    expect(isSafeUrl(absentUrl)).toBeFalsy()
    expect(isSafeUrl(null)).toBeFalsy()
    expect(isSafeUrl(42)).toBeFalsy()
    expect(isSafeUrl({ url: 'https://example.com' })).toBeFalsy()
  })
})
