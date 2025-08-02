
const AIContextDescription = () => {
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="text-sm space-y-2">
        <p className="font-medium text-blue-900 dark:text-blue-100">
          Enhanced AI Conversations
        </p>
        <p className="text-blue-800 dark:text-blue-200">
          When enabled, your AI Guardian will have access to insights from your medical documents and medications, providing more personalized and contextually relevant therapeutic guidance.
        </p>
        <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1 mt-2">
          <li>Identifies relevant medical conditions and patterns</li>
          <li>Detects potential medication interactions</li>
          <li>Provides bipolar-specific risk factor analysis</li>
          <li>Offers personalized coping strategies</li>
        </ul>
      </div>
    </div>
  );
};

export default AIContextDescription;
