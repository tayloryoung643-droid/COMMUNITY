import './GuidelinesContent.css'

const GUIDELINES = [
  {
    emoji: '🤝',
    title: 'Be Respectful',
    description: "Treat your neighbors the way you'd want to be treated. No harassment, personal attacks, or discriminatory language."
  },
  {
    emoji: '🏠',
    title: 'Keep It Relevant',
    description: 'Posts should relate to your building or neighborhood. Use the Bulletin Board for buying, selling, or services.'
  },
  {
    emoji: '🔒',
    title: 'Protect Privacy',
    description: "Don't share other residents' personal information — unit numbers, phone numbers, or photos — without their consent."
  },
  {
    emoji: '🚫',
    title: 'Zero Tolerance for Hate',
    description: 'Racism, sexism, homophobia, or any form of discrimination results in immediate removal. No exceptions.'
  },
  {
    emoji: '🚩',
    title: "Report, Don't Retaliate",
    description: "See something wrong? Use the report button. Your building manager will review it. Don't engage or escalate."
  },
  {
    emoji: '💛',
    title: 'Build Community',
    description: 'This is your space to connect, help each other, and make your building feel like home. Have fun with it.'
  }
]

function GuidelinesContent() {
  return (
    <div className="guidelines-items">
      {GUIDELINES.map((item, i) => (
        <div key={i} className="guideline-row">
          <div className="guideline-emoji-box">
            <span>{item.emoji}</span>
          </div>
          <div className="guideline-text">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default GuidelinesContent
