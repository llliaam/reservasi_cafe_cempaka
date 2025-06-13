import React, { useState, useEffect } from 'react';

const ContactUs = () => {
  // State untuk form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    subject: ''
  });

  // State untuk validasi dan feedback
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Cek validasi form secara keseluruhan
  useEffect(() => {
    const isValid =
      formData.firstName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.email.includes('@') &&
      formData.message.trim() !== '' &&
      !errors.firstName &&
      !errors.email &&
      !errors.phone &&
      !errors.message;

    setFormValid(isValid);
  }, [formData, errors]);

  // Handle perubahan input dengan validasi yang lebih baik
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (!formTouched) {
      setFormTouched(true);
    }

    validateField(name, value);
  };

  // Validasi field individu
  const validateField = (name: string, value: string) => {
    let errorMessage = '';

    switch (name) {
      case 'firstName':
        errorMessage = value.trim() === '' ? 'Nama depan wajib diisi' : '';
        break;

      case 'email':
        if (value.trim() === '') {
          errorMessage = 'Email wajib diisi';
        } else if (!value.includes('@') || !value.includes('.')) {
          errorMessage = 'Format email tidak valid';
        }
        break;

      case 'phone':
        const numericValue = value.replace(/\D/g, "");
        if (value && (numericValue.length < 10 || numericValue.length > 13)) {
          errorMessage = 'Nomor telepon harus 10-13 digit';
        }
        break;

      case 'message':
        errorMessage = value.trim() === '' ? 'Pesan wajib diisi' : '';
        break;

      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  // Format nomor telepon untuk tampilan yang lebih baik
  const formatPhoneNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    if (numericValue.length <= 4) {
      return numericValue;
    } else if (numericValue.length <= 8) {
      return `${numericValue.slice(0, 4)}-${numericValue.slice(4)}`;
    } else {
      return `${numericValue.slice(0, 4)}-${numericValue.slice(4, 8)}-${numericValue.slice(8, 12)}`;
    }
  };

  // Handle blur untuk validasi saat user selesai mengisi field
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Handle submit form dengan feedback yang lebih baik
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    Object.keys(formData).forEach(key => {
      validateField(key, formData[key as keyof typeof formData]);
    });

    if (formValid) {
      setIsSubmitting(true);

      setTimeout(() => {
        console.log('Form submitted:', formData);
        setIsSubmitting(false);
        setSubmitSuccess(true);

        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            message: '',
            subject: ''
          });
          setSubmitSuccess(false);
          setFormTouched(false);
        }, 3000);
      }, 1500);
    }
  };

  return (
    <>
      {/* Contact Section - Made Smaller */}
      <div id="contact" className="w-full py-12 bg-orange-50/30">
        <div className="max-w-5xl px-4 mx-auto">
          <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
            <div className="flex flex-col lg:flex-row">
              {/* Bagian informasi kontak */}
              <div className="w-full p-6 lg:w-2/5 bg-gradient-to-br from-orange-400 to-orange-300">
                <h2 className="mb-3 text-2xl font-bold text-gray-800">Hubungi Kami</h2>
                <p className="mb-6 leading-relaxed text-gray-700">Silakan hubungi kami untuk pertanyaan, saran, atau reservasi. Kami akan senang mendengar dari Anda!</p>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 p-2 mt-1 transition-all bg-orange-200 rounded-full group-hover:bg-orange-300">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">Email</h3>
                      <a
                        href="mailto:Cempakacafe@gmail.com"
                        className="text-sm text-gray-800 transition-colors hover:text-orange-600"
                      >
                        Cempakacafe@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 p-2 mt-1 transition-all bg-orange-200 rounded-full group-hover:bg-orange-300">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">Telepon</h3>
                      <a
                        href="tel:+6281376973443"
                        className="text-sm text-gray-800 transition-colors hover:text-orange-600"
                      >
                        +0813-7697-3443
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 p-2 mt-1 transition-all bg-orange-200 rounded-full group-hover:bg-orange-300">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">Alamat</h3>
                      <address className="text-sm not-italic leading-relaxed text-gray-800">
                        Jl. Bunga Cemp. No.22,<br />
                        Padang Bulan Selayang II,<br />
                        Kec. Medan Selayang,<br />
                        Kota Medan,<br />
                        Sumatera Utara 20131
                      </address>
                      <a
                        href="https://maps.google.com/?q=Cempaka+Cafe+Medan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        Lihat di Maps →
                      </a>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 p-2 mt-1 transition-all bg-orange-200 rounded-full group-hover:bg-orange-300">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase">Instagram</h3>
                      <a
                        href="https://instagram.com/cempakacafedanresto_mdn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-800 transition-colors hover:text-orange-600"
                      >
                        @cempakacafedanresto_mdn
                      </a>
                    </div>
                  </div>
                </div>

                {/* Jam Operasional */}
                <div className="p-4 mt-6 bg-white border border-orange-100 shadow-sm rounded-xl">
                  <h3 className="mb-3 text-base font-bold text-gray-800">Jam Operasional</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Senin - Jumat</span>
                      <span className="px-2 py-1 text-xs font-semibold text-gray-800 rounded-full bg-orange-50">10:00 - 22:00</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sabtu - Minggu</span>
                      <span className="px-2 py-1 text-xs font-semibold text-gray-800 rounded-full bg-orange-50">09:00 - 23:00</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bagian form kontak */}
              <div className="flex flex-col justify-center w-full bg-white lg:w-3/5">
                <div className="p-6 pt-8 lg:pt-10">
                  <div onSubmit={handleSubmit}>
                    <h3 className="mb-6 text-xl font-bold text-left text-gray-800">Kirim Pesan</h3>

                    <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                      {/* Nama */}
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block mb-2 text-sm font-semibold text-gray-700"
                        >
                          Nama Depan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          className={`w-full px-3 py-2 text-gray-800 border-2 rounded-lg transition-all focus:outline-none ${
                            errors.firstName
                              ? 'border-red-500 bg-red-50 focus:border-red-500'
                              : 'border-gray-200 focus:border-orange-500 focus:bg-orange-50/30'
                          }`}
                          placeholder="Masukkan nama depan"
                        />
                        {errors.firstName && (
                          <p className="flex items-center mt-1 text-xs text-red-500">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block mb-2 text-sm font-semibold text-gray-700"
                        >
                          Nama Belakang
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-gray-800 transition-all border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:bg-orange-50/30"
                          placeholder="Masukkan nama belakang"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-semibold text-gray-700"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`w-full px-3 py-2 text-gray-800 border-2 rounded-lg transition-all focus:outline-none ${
                          errors.email
                            ? 'border-red-500 bg-red-50 focus:border-red-500'
                            : 'border-gray-200 focus:border-orange-500 focus:bg-orange-50/30'
                        }`}
                        placeholder="contoh@email.com"
                      />
                      {errors.email && (
                        <p className="flex items-center mt-1 text-xs text-red-500">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="mb-4">
                      <label
                        htmlFor="phone"
                        className="block mb-2 text-sm font-semibold text-gray-700"
                      >
                        Telepon
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-medium text-gray-500">
                          +62
                        </span>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formatPhoneNumber(formData.phone)}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg transition-all focus:outline-none ${
                            errors.phone
                              ? 'border-red-500 bg-red-50 focus:border-red-500'
                              : 'border-gray-200 focus:border-orange-500 focus:bg-orange-50/30'
                          }`}
                          placeholder="812-3456-7890"
                          inputMode="numeric"
                        />
                      </div>
                      {errors.phone ? (
                        <p className="flex items-center mt-1 text-xs text-red-500">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.phone}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          Format: 812-3456-7890 (tanpa awalan 0)
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-semibold text-gray-700"
                      >
                        Pesan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={4}
                        required
                        className={`w-full px-3 py-2 text-gray-800 border-2 rounded-lg transition-all focus:outline-none resize-none ${
                          errors.message
                            ? 'border-red-500 bg-red-50 focus:border-red-500'
                            : 'border-gray-200 focus:border-orange-500 focus:bg-orange-50/30'
                        }`}
                        placeholder="Tulis pesan Anda di sini..."
                      ></textarea>
                      {errors.message && (
                        <p className="flex items-center mt-1 text-xs text-red-500">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit button */}
                    <div className="text-center">
                      <button
                        type="submit"
                        disabled={isSubmitting || (!formTouched || !formValid)}
                        className={`w-full md:w-auto px-6 py-3 font-semibold rounded-full transition-all transform hover:scale-105 ${
                          isSubmitting || (!formTouched || !formValid)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengirim...
                          </span>
                        ) : (
                          "Kirim Pesan"
                        )}
                      </button>
                    </div>

                    {/* Success message */}
                    {submitSuccess && (
                      <div
                        className="flex items-center p-3 mt-4 text-green-800 bg-green-100 border border-green-200 rounded-lg"
                        role="alert"
                      >
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <div>
                          <p className="text-sm font-semibold">Pesan Berhasil Dikirim!</p>
                          <p className="text-xs">Terima kasih telah menghubungi kami. Kami akan merespons segera.</p>
                        </div>
                      </div>
                    )}

                    {/* Required fields note */}
                    <p className="mt-4 text-xs text-center text-gray-500">
                      <span className="text-red-500">*</span> menandakan kolom yang wajib diisi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
