import './intro.scss';

export function Intro() {
  return (
    <div className="intro">
      {'NEO CRAFT'.split('').map((letter, i) => {
        const rand = Math.ceil(Math.random() * 5);
        return (
          <span
            key={i}
            className={`letter ${letter === 'N' ? 'n' : ''} ${letter === 'C' ? 'c' : ''} disperse-${rand}`}
            style={{'--i': i}}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
}
