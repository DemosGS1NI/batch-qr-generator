<script>
  import { generatePDF } from '$lib/utils';
  import { generateZPL, downloadZPL, printZPL } from '$lib/zebra-utils';

  let file;
  let data = [];
  let isGeneratingZPL = false;
  let zplCode = '';

  // Function to upload the Excel file and parse the data
  const uploadFile = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        data = await response.json();
        console.log("Data loaded:", data);
      } else {
        alert('Failed to upload file.');
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert('Error uploading file: ' + error.message);
    }
  };

  // Function to generate the PDF with labels
  const createPDF = () => {
    if (data.length === 0) {
      alert('No data to generate labels.');
      return;
    }
    generatePDF(data);
  };

  // Function to generate ZPL code
  const createZPL = async () => {
    if (data.length === 0) {
      alert('No data to generate labels.');
      return;
    }
    
    isGeneratingZPL = true;
    try {
      console.log("Generating ZPL for data:", data);
      zplCode = await generateZPL(data);
      console.log("ZPL generated:", zplCode.substring(0, 200) + "...");
    } catch (error) {
      console.error('Error generating ZPL:', error);
      alert('Error generating ZPL code: ' + error.message);
    } finally {
      isGeneratingZPL = false;
    }
  };

  // Function to download ZPL file
  const handleDownloadZPL = () => {
    if (!zplCode) {
      alert('Please generate ZPL code first.');
      return;
    }
    downloadZPL(zplCode);
  };

  // Function to print ZPL directly
  const handlePrintZPL = async () => {
    if (!zplCode) {
      alert('Please generate ZPL code first.');
      return;
    }
    
    const success = await printZPL(zplCode);
    if (!success) {
      alert('Print failed. If using Zebra Browser Print, make sure it is installed and running.');
    }
  };
</script>

<div class="p-4">
  <h1 class="text-xl font-bold mb-4">Label Generator</h1>

  <!-- File input -->
  <input
    type="file"
    on:change="{(e) => file = e.target.files[0]}"
    class="mb-4 block border border-gray-300 rounded p-2"
  />

  <!-- Upload button -->
  <button
    class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mr-2"
    on:click="{uploadFile}"
  >
    Upload
  </button>

  <!-- Table and buttons -->
  {#if data.length > 0}
    <div class="my-4">
      <p>Loaded {data.length} records</p>
    </div>
    
    <table class="table-auto mt-4 w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-200">
          <th class="border border-gray-300 px-4 py-2">Model</th>
          <th class="border border-gray-300 px-4 py-2">GTIN</th>
          <th class="border border-gray-300 px-4 py-2">Production Date</th>
          <th class="border border-gray-300 px-4 py-2">Serial</th>
        </tr>
      </thead>
      <tbody>
        {#each data.slice(0, 5) as row}
          <tr>
            <td class="border border-gray-300 px-4 py-2">{row.model}</td>
            <td class="border border-gray-300 px-4 py-2">{row.gtin}</td>
            <td class="border border-gray-300 px-4 py-2">{row['production date']}</td>
            <td class="border border-gray-300 px-4 py-2">{row.serial}</td>
          </tr>
        {/each}
        {#if data.length > 5}
          <tr>
            <td colspan="4" class="border border-gray-300 px-4 py-2 text-center text-gray-500">
              Showing 5 of {data.length} records
            </td>
          </tr>
        {/if}
      </tbody>
    </table>

    <div class="mt-4 flex space-x-2">
      <!-- Generate PDF button -->
      <button
        class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
        on:click="{createPDF}"
      >
        Generate PDF
      </button>

      <!-- Generate ZPL button -->
      <button
        class="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition"
        on:click="{createZPL}"
        disabled={isGeneratingZPL}
      >
        {isGeneratingZPL ? 'Generating...' : 'Generate ZPL'}
      </button>
    </div>

    <!-- ZPL Actions -->
    {#if zplCode}
      <div class="mt-4 p-4 bg-gray-100 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">ZPL Code Generated</h2>
        <p class="mb-4">Use one of the options below to print to your Zebra ZD220 printer:</p>
        
        <div class="flex space-x-2">
          <button
            class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            on:click="{handleDownloadZPL}"
          >
            Download ZPL File
          </button>
          
          <button
            class="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition"
            on:click="{handlePrintZPL}"
          >
            Print via Browser
          </button>
        </div>
        
        <details class="mt-4">
          <summary class="cursor-pointer text-blue-700">View ZPL Code (first 500 characters)</summary>
          <pre class="mt-2 bg-gray-800 text-white p-4 rounded text-xs overflow-auto max-h-64">{zplCode.substring(0, 500)}...</pre>
        </details>
      </div>
    {/if}
  {/if}
</div>