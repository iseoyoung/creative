const flowerNames = /^(lilacs?|carnations?|roses?)$/i
const namesInSentence = /(\b(?:lilacs?|carnations?|roses?)\b)/gi

export default function FlowerQuote({ sentence }) {
  return (
    <p className="quotation">“{sentence.split(namesInSentence).map((part, index) => {
      if (!flowerNames.test(part)) return part
      const name = part.toLowerCase()
      const kind = name.startsWith('lilac') ? 'lilac' : name.startsWith('carnation') ? 'carnations' : 'roses'
      return <span className={`quotation-flower quotation-flower--${kind}`} key={index}>{part}</span>
    })}”</p>
  )
}
