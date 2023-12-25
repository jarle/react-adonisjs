import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

export const action = () => {
  return json({
    message: 'Thank you for your feedback!',
  })
}

export default function Page() {
  const actionData = useActionData<typeof action>()

  return (
    <>
      <h1>Feedback</h1>
      <Form method="post">
        <label>
          Name
          <input type="text" name="name" id="name" required />
        </label>
        <br />
        <label>
          Email
          <input type="email" name="email" id="email" required />
        </label>
        <br />
        <label>
          Message
          <textarea name="message" id="message" />
        </label>
        <br />
        <button type="submit">Submit</button>
      </Form>
      {actionData ? <p className="alert">{actionData.message}</p> : null}
    </>
  )
}
