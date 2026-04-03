export default function DisclaimerFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-max text-center">
        <p className="text-xs leading-relaxed max-w-3xl mx-auto">
          <span className="text-white font-semibold">Solo para uso interno</span> — Este es un
          prototipo conceptual creado para discusión interna. No constituye una oferta de inversión,
          asesoría financiera ni recomendación de productos. Todos los datos mostrados son
          ilustrativos. Los rendimientos pasados no garantizan rendimientos futuros. Las inversiones
          en ETFs están sujetas a riesgos de mercado, incluyendo la posible pérdida del capital
          invertido.
        </p>
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} BlackRock, Inc. Todos los derechos reservados.
            iShares&reg; es una marca registrada de BlackRock, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
