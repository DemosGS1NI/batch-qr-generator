<script>
    import { generatePDF } from '$lib/utils';
  
    let file;
    let data = [];
  
    // Function to upload the Excel file and parse the data
    const uploadFile = async () => {
      if (!file) {
        alert('Please select a file to upload.');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        data = await response.json();
      } else {
        alert('Failed to upload file.');
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
  </script>
  
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Label Generator</h1>
  
    <!-- File input -->
    <input
      type="file"
      on:change="{e => file = e.target.files[0]}"
      class="mb-4 block border border-gray-300 rounded p-2"
    />
  
    <!-- Upload button -->
    <button
      class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
      on:click="{uploadFile}"
    >
      Upload
    </button>
  
    <!-- Table and Generate PDF button -->
    {#if data.length > 0}
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
          {#each data as row}
            <tr>
              <td class="border border-gray-300 px-4 py-2">{row.model}</td>
              <td class="border border-gray-300 px-4 py-2">{row.gtin}</td>
              <td class="border border-gray-300 px-4 py-2">{row['production date']}</td>
              <td class="border border-gray-300 px-4 py-2">{row.serial}</td>
            </tr>
          {/each}
        </tbody>
      </table>
  
      <!-- Generate PDF button -->
      <button
        class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition mt-4"
        on:click="{createPDF}"
      >
        Generate PDF
      </button>
    {/if}
  </div>

  