import Link from 'next/link';
export function Sidebar() {
  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/' },
    { icon: '👥', label: 'Leads', path: '/leads' },
    { icon: '💬', label: 'Messaging', path: '/messaging' },
    { icon: '📧', label: 'Emails', path: '/emails' },
    { icon: '📅', label: 'Calendar', path: '/calendar' },
    { icon: '📞', label: 'AI Calls', path: '/calls' },
    { icon: '⚙️', label: 'Settings', path: '../../setting' },
    { icon: '❓', label: 'Help/Support', path: '/support' }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen p-4">
      <div className="flex items-center mb-8">
        <h1 className="text-xl font-bold">ReplyQuick.AI</h1>
      </div>
      <nav>
        {menuItems.map((item) => (
          <Link 
            key={item.path}
            href={item.path}
            className="flex items-center p-3 mb-2 hover:bg-gray-100 rounded-lg"
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
} 