(() => {
  const form = document.querySelector('[data-lead-form]')
  if (!form) return
  const status = form.querySelector('[data-form-status]')
  const button = form.querySelector('button[type="submit"]')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!form.reportValidity()) return
    button.disabled = true
    status.textContent = 'Even verzenden…'

    try {
      const payload = Object.fromEntries(new FormData(form).entries())
      const response = await fetch(form.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Verzenden is niet gelukt.')
      form.reset()
      status.textContent = 'Bedankt! Je bericht is goed ontvangen.'
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'Verzenden is niet gelukt.'
    } finally {
      button.disabled = false
    }
  })
})()
