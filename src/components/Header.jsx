import React from 'react'

export const Header = ({ handleLogout, setMenuOpen, user, menuOpen }) => {
  return (
    <header className="bg-white shadow flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="relative">
            <img
                src={user?.photoURL || "/placeholder-user.png"}
                alt="User Profile"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={setMenuOpen}
            />
            {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-md rounded-lg py-2 w-48">
                    <div className="px-4 py-2">
                        <p className="font-semibold">{user?.displayName || "Admin"}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    <hr />
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    </header>
  )
}
