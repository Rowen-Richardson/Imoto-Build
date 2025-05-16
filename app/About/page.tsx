export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-hunter mb-6">About imoto</h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Building an innovative platform for automotive enthusiasts and everyday drivers alike.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-hunter mb-4">Our Vision</h2>
          <p className="text-gray-700 mb-4">
            At imoto, we're reimagining the car buying and selling experience. Our platform connects automotive
            enthusiasts with their dream vehicles while providing a seamless, transparent marketplace for all users.
          </p>
          <p className="text-gray-700">
            We believe that finding the perfect car should be an exciting journey, not a stressful process.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-hunter mb-4">Our Values</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-pumpkin font-bold mr-2">•</span>
              <span>
                <strong>Transparency:</strong> We believe in honest, clear communication about every vehicle.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-pumpkin font-bold mr-2">•</span>
              <span>
                <strong>Innovation:</strong> We continuously improve our platform to better serve our community.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-pumpkin font-bold mr-2">•</span>
              <span>
                <strong>Community:</strong> We foster connections between car enthusiasts and sellers.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-pumpkin font-bold mr-2">•</span>
              <span>
                <strong>Quality:</strong> We maintain high standards for the vehicles on our platform.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
        <h2 className="text-2xl font-semibold text-hunter mb-6 text-center">Our Story</h2>
        <p className="text-gray-700 mb-4">
          imoto was founded by a group of automotive enthusiasts who saw an opportunity to create a better car
          marketplace. Frustrated with the existing options, we set out to build a platform that puts users first and
          makes the process of buying and selling vehicles more enjoyable.
        </p>
        <p className="text-gray-700">
          Today, we're growing our community of drivers and enthusiasts who share our passion for automobiles. Whether
          you're looking for your first car or your dream car, imoto is here to help you find exactly what you're
          looking for.
        </p>
      </div>
    </div>
  )
}
