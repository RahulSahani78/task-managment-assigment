const palette = [
  ['#34d399', '#0f766e'],
  ['#60a5fa', '#1e40af'],
  ['#f59e0b', '#92400e'],
  ['#f472b6', '#9d174d'],
  ['#a78bfa', '#5b21b6'],
  ['#fb7185', '#9f1239'],
  ['#22d3ee', '#155e75'],
];

const colorFor = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const [bg, fg] = palette[Math.abs(hash) % palette.length];
  return { bg, fg };
};

const initials = (name = '?') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

export default function Avatar({ name, size, title }) {
  const { bg, fg } = colorFor(name || '');
  return (
    <span
      className={`avatar ${size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : ''}`}
      title={title || name}
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, ${fg} 100%)`,
        color: '#fff',
      }}
    >
      {initials(name)}
    </span>
  );
}
