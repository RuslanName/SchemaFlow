import { Asterisk } from 'lucide-react'

const COUNT = 8

export function PasswordStars() {
  return (
    <span className="password-stars" aria-label="Скрытый пароль" title="Пароль скрыт">
      {Array.from({ length: COUNT }, (_, i) => (
        <Asterisk
          key={i}
          size={11}
          strokeWidth={2.25}
          className="password-stars__icon"
          aria-hidden
        />
      ))}
    </span>
  )
}
