import { RequestFactory, ResponseFactory } from '@adonisjs/core/factories/http'
import { test } from '@japa/runner'
import { RequestOptions, ResponseOptions, createRequest, createResponse } from 'node-mocks-http'
import { ServerResponse } from 'node:http'
import { createRemixHeaders, createRemixRequest } from '../src/remix_adapter.js'

test.group('createRemixHeaders', () => {
  test('handles empty headers', ({ expect }) => {
    const headers = createRemixHeaders({})
    expect(headers instanceof Headers).toBe(true)
    expect(Object.fromEntries(headers.entries())).toMatchObject({})
  })

  test('handles simple headers', ({ expect }) => {
    const expressHeaders = { 'x-foo': 'bar' }
    const headers = createRemixHeaders(expressHeaders)

    expect(headers.get('x-foo')).toBe('bar')
  })

  test('handles multiple headers', ({ expect }) => {
    const expressHeaders = { 'x-foo': 'bar', 'x-bar': 'baz' }
    const headers = createRemixHeaders(expressHeaders)

    expect(headers.get('x-foo')).toBe('bar')
    expect(headers.get('x-bar')).toBe('baz')
  })

  test('handles headers with multiple values', ({ expect }) => {
    const expressHeaders = {
      'x-foo': ['bar', 'baz'],
      'x-bar': 'baz',
    }
    const headers = createRemixHeaders(expressHeaders)

    expect(headers.get('x-foo')).toEqual('bar, baz')
    expect(headers.get('x-bar')).toBe('baz')
  })

  test('handles multiple set-cookie headers', ({ expect }) => {
    const expressHeaders = {
      'set-cookie': [
        '__session=some_value; Path=/; Secure; HttpOnly; MaxAge=7200; SameSite=Lax',
        '__other=some_other_value; Path=/; Secure; HttpOnly; Expires=Wed, 21 Oct 2015 07:28:00 GMT; SameSite=Lax',
      ],
    }
    const headers = createRemixHeaders(expressHeaders)

    expect(headers.get('set-cookie')).toEqual(
      '__session=some_value; Path=/; Secure; HttpOnly; MaxAge=7200; SameSite=Lax, __other=some_other_value; Path=/; Secure; HttpOnly; Expires=Wed, 21 Oct 2015 07:28:00 GMT; SameSite=Lax'
    )
  })
})

test.group('Remix Adapter Tests', () => {
  test('creates a request with the correct headers', async ({ assert }) => {
    const request = testRequest({
      url: '/foo/bar',
      method: 'GET',
      protocol: 'http',
      hostname: 'localhost',
      headers: {
        'Cache-Control': 'max-age=300, s-maxage=3600',
        'Host': 'localhost:3000',
      },
    })

    const response = testResponse()
    const remixRequest = createRemixRequest(request, response)

    assert.equal(remixRequest.method, 'GET')
    assert.equal(remixRequest.headers.get('cache-control'), 'max-age=300, s-maxage=3600')
    assert.equal(remixRequest.headers.get('host'), 'localhost:3000')
  })
})

function testRequest(options?: RequestOptions | undefined) {
  return new RequestFactory()
    .merge({
      req: createRequest(options),
    })
    .create()
}
function testResponse(options?: ResponseOptions | undefined) {
  const res = createResponse<ServerResponse>(options)
  return new ResponseFactory().merge({ res }).create()
}
