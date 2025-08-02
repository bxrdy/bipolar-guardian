
const SettingsFooter = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
      <h3 className="font-medium text-gray-900 mb-2">Your Data, Your Control</h3>
      <ul className="text-sm text-gray-600 space-y-2">
        <li>• All data is encrypted and stored securely</li>
        <li>• You can export or delete your data at any time</li>
        <li>• We never share your personal information with third parties</li>
        <li>• Data collection can be paused or resumed instantly</li>
      </ul>
    </div>
  );
};

export default SettingsFooter;
