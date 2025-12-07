import React from 'react'
import Link from "next/link";
import Image from "next/image";
import food_icon from "../../../../public/food_icon.webp";
const Footer = () => {
  return (
    <div>
      
      <footer className="bg-gray-900 dark:bg-gray-900  bottom-0 left-0 w-full">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <Image
                src={food_icon}
                alt="Chefalarab Logo"
                width={60}
                height={60}
                className="h-16 me-3"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
                شيف العرب
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold  uppercase text-white">
                Resources
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link href="/" className="hover:underline">
                    chefalarab
                  </Link>
                </li>
                <li className="mb-4">
                  <Link href="/recipe" className="hover:underline">
                    Recipes
                  </Link>
                </li>
              
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold  uppercase text-white">
                Follow us
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link href="/about_us" className="hover:underline">
                    About_Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact_us" className="hover:underline">
                    Contact_Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold  uppercase text-white">
                Legal
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link href="/privacy_policy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms_conditions" className="hover:underline">
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />


        <div className="sm:flex sm:items-center sm:justify-between">
  <span className="text-xs text-gray-400 sm:text-left dark:text-gray-500">
    © {new Date().getFullYear()}{" "}
    <Link href="/" className="hover:underline text-gray-400 dark:text-gray-500">
      شيف العرب™
    </Link>
    . All Rights Reserved.
  </span>

  <div className="flex mt-4 sm:mt-0 gap-5">
    {/* WhatsApp */}
    <Link href="https://wa.me/2011111111111?text=" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-400">
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163a11.946 11.946 0 01-1.63-6.012C.114 5.305 5.48 0 12.006 0c3.2 0 6.194 1.247 8.453 3.507a11.904 11.904 0 013.513 8.493c-.003 6.526-5.379 11.891-12.006 11.891a11.954 11.954 0 01-6.936-2.55L.057 24zm6.597-3.807c1.09.323 2.24.497 3.436.497 5.406 0 9.795-4.392 9.798-9.802.003-2.62-1.02-5.082-2.878-6.935C14.2 2.02 11.736 1 9.12 1 4.72 1 .33 5.392.327 10.801c0 2.486 1.036 4.835 2.875 6.581l-.63 2.31 4.082-1.699zM17.73 14.91c-.29-.145-1.718-.846-1.986-.94-.267-.093-.46-.145-.654.146-.194.29-.75.94-.918 1.13-.17.194-.338.218-.628.073-.29-.145-1.223-.451-2.33-1.44-.861-.766-1.44-1.713-1.61-2.003-.17-.29-.018-.447.127-.592.13-.13.29-.338.435-.507.145-.17.194-.29.29-.483.097-.194.048-.364-.024-.507-.072-.145-.654-1.58-.896-2.164-.236-.567-.476-.49-.654-.5l-.558-.01c-.194 0-.507.073-.773.364s-1.014.991-1.014 2.415c0 1.423 1.038 2.797 1.183 2.991.145.194 2.04 3.12 4.938 4.377.69.297 1.228.474 1.647.607.692.22 1.323.19 1.822.115.556-.085 1.718-.7 1.958-1.38.24-.681.24-1.264.17-1.38-.072-.114-.263-.19-.553-.335z"/>
      </svg>
    </Link>

    {/* Telegram */}
    <Link href="tel:00000000000000" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-400">
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm5.945 8.596l-1.418 6.69c-.107.515-.39.642-.788.401l-2.188-1.615-1.055 1.014c-.116.116-.213.213-.435.213l.155-2.183 3.983-3.6c.173-.155-.038-.242-.267-.087l-4.915 3.09-2.117-.661c-.46-.143-.471-.46.096-.678l8.288-3.192c.384-.143.718.087.59.661z"/>
      </svg>
    </Link>

    {/* Email */}
    <Link href="mailto:chefalarabonline@gmail.com" className="text-gray-500 hover:text-orange-400">
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12.713l-11.714-7.713h23.428l-11.714 7.713zm-12-8.713v16h24v-16h-24zm22 2.667v.553l-10 6.586-10-6.586v-.553h20z"/>
      </svg>
    </Link>
  </div>
</div>


      </div>
    </footer>
    </div>
  )
}

export default Footer