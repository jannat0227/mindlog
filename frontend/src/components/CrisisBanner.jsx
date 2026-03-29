import { useState } from 'react'

export default function CrisisBanner({ onDismiss }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    if (onDismiss) onDismiss()
  }

  return (
    <div className="crisis-banner" role="alert" aria-live="assertive">
      <div className="crisis-banner-header">
        <div className="crisis-icon">💛</div>
        <h3>You don't have to face this alone</h3>
      </div>
      <p>
        We noticed you're having a really tough time right now. Your feelings are completely valid.
        Trained support is available right now — please reach out.
      </p>
      <ul className="crisis-resources">
        <li>
          <strong>Samaritans</strong>
          Call <strong>116 123</strong> — free, 24/7<br />
          <a href="https://www.samaritans.org" target="_blank" rel="noreferrer">samaritans.org</a>
        </li>
        <li>
          <strong>Mind</strong>
          Call <strong>0300 123 3393</strong> — Mon–Fri 9am–6pm<br />
          <a href="https://www.mind.org.uk" target="_blank" rel="noreferrer">mind.org.uk</a>
        </li>
        <li>
          <strong>Crisis Text Line</strong>
          Text <strong>HELLO</strong> to <strong>85258</strong> — free, 24/7
        </li>
        <li>
          <strong>NHS Urgent Help</strong>
          Call <strong>111</strong> → select mental health option
        </li>
      </ul>
      <button className="crisis-dismiss" onClick={handleDismiss}>
        I've read this, dismiss
      </button>
    </div>
  )
}
