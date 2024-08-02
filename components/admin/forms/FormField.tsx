import { Field, ErrorMessage } from 'formik';

const FormField = ({field, label, description=false}:{ field:string, label?:string, description?:boolean|string }) => {
  const fieldId = `${field}-description`
  return (
    <div className='text-left'>
      <label htmlFor={field} className="block text-sm font-medium leading-6 text-gray-900 capitalize">
        {label || field}
      </label>
      <div className="mt-2">
        <Field type="text" name={field} 
          className="block w-full rounded-md  py-1.5 px-2 
          bg-gray-50 text-gray-900  placeholder:text-gray-400  sm:text-sm sm:leading-6 focus:border-none
          shadow-sm ring-gray-300 focus:ring-4 focus:ring-aqua-600"/>
         
      </div>
      
      <ErrorMessage name={field}/>
      <p id={fieldId} className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </div>
  )

}

export default FormField