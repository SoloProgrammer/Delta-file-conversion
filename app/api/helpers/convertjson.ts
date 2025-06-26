import fs from "fs/promises";
// const jsonata = require('jsonata');

/**
 * Read JSON from file, apply a JSONata transformation, and return the transformed data.
 * @param {string} inputFilePath - Path to the input JSON file
 * @param {string} jsonataExpr - JSONata expression string
 * @param {string} outputFilePath - Path to save the transformed JSON file (optional)
 */
async function transformJsonFromFile(inputFilePath = "", jsonataExpr = "", outputFilePath = "", ENTITYTYPE = "Firm") {
  try {
    // Step 1: Read the JSON file
    const rawData = await fs.readFile(inputFilePath, "utf8");
    const jsonData = JSON.parse(rawData); // Parse the file into JSON

    // Step 2: Apply the JSONata expression (Transformation)
    // const expression = jsonata(jsonataExpr);
    // const transformedData = await expression.evaluate(jsonData);
    const transformedData: any[] = [];
    jsonData.forEach((row: any) => {
      if (
        row.ENTITYTYPE == ENTITYTYPE &&
        !transformedData.some((item) => item.test === "CFP_" + row.LICENSENUMBER) &&
        !isDateInPast(row.EXPIRATIONDATE)
      ) {
        let data = {
          ctspartitionkey: "CFP_" + row.LICENSENUMBER,
          Client: "CFP",
          Code: "",
          Name: row.PRODUCERNAME,
          Status: "Active",
          Products: ["CFCFDP1CO"],
          Reference: [],
          ExternalEntityIdentifier: {
            code: "ENTITY ID",
            value: row.ENTITYTYPE,
          },
          NPN: row.NPN,
          LicenseDetails: {
            LicenseType: row.LICENSETYPE,
            LicenseNumber: row.LICENSENUMBER,
            EffectiveDate: row.EFFECTIVEDATE,
            ExpirationDate: row.EXPIRATIONDATE,
            Qualification: row.QUALIFICATION,
            QualificationEffectiveDate: row.QUALIFICATIONEFFECTIVEDATE,
          },
          Details: {
            Contact: {
              HomePhone: row.MAILINGPHONE,
              BusinessPhone: row.BUSINESSPHONE,
              Fax: "",
              MobilePhone: row.MAILINGPHONE,
              SendSms: false,
              EmailId: row.MAILINGEMAILADDRESS,
              SendQuoteEmail: false,
              QuoteEmailId: row.MAILINGEMAILADDRESS,
              SendPolicyEmail: false,
              PolicyEmailId: row.MAILINGEMAILADDRESS,
              FromEmailId: row.MAILINGEMAILADDRESS,
              EmailCCId: row.MAILINGEMAILADDRESS,
              PreferedContactType: "E",
              SecondaryEmailId: row.MAILINGEMAILADDRESS,
            },
          },
          Address: {
            IsManual: null,
            StreetName: row.PREFERREDPOSTALADDRESS,
            AddressLine1: null,
            AddressLine2: null,
            City: "",
            State: "",
            County: "",
            CountyCode: null,
            Zip: "",
            Country: "US",
            CountryCode: "US",
            PlaceId: null,
            Number: null,
            Name: null,
            Long: null,
            Lat: null,
            Description: null,
            AddressType: "M",
            FormattedAddress: null,
            UnFormattedAddress: row.PREFERREDPOSTALADDRESS,
            Status: null,
            AptSuite: null,
            PoBox: null,
            CityCode: null,
            Territory: null,
            TerritoryCode: null,
          },
          Communications: [
            {
              Type: "PhNo",
              SubType: "Primary",
              Value: row.BUSINESSPHONE,
              Status: "Active",
            },
            {
              Type: "Email",
              SubType: "Primary",
              Value: row.MAILINGEMAILADDRESS || "",
              Status: "Active",
            },
          ],
        };
        transformedData.push(data);
      }
    });

    // Step 3: Output the result to console (optional for debugging)
    // process.env.NODE_ENV !== "production" && console.log('Transformed JSON:', JSON.stringify(transformedData, null, 2));

    // Step 4: If an output file path is provided, wait to write the transformed data to the file
    if (outputFilePath) {
      outputFilePath = outputFilePath.split(".json")[0] + `_${transformedData.length}.json`
      await fs.writeFile(outputFilePath, JSON.stringify(transformedData, null, 2), "utf8");
      //   process.env.NODE_ENV !== "production" && console.log(`✅ Saved transformed JSON to ${outputFilePath}`);
    }
    return outputFilePath;
  } catch (err: any) {
    console.error("❌ Error:", err.message); // Handle any errors during reading, transforming, or writing
  }
}

function isDateInPast(dateString: string = "") {
  const inputDate = new Date(dateString);
  const today = new Date();

  // Set time of both dates to midnight to compare only dates
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return inputDate < today;
}

// Example usage with async/await flow:
const jsonataExpr = `
    $map($filter($, function($v){
    $v.ENTITYTYPE = 'Firm'
}), function($v){
    {
        "Client": "CFP",
        "Code": $v.LICENSENUMBER,
        "Name": $v.PRODUCERNAME,
        "Status": "Active",
        "Products": [
            "CFCFDP1CO"
        ],
        "Reference": [
            $v.NPN,
            $v.LICENSENUMBER
        ],
        "ExternalEntityIdentifier": {
            "code": "ENTITY ID",
            "value": $v.ENTITYTYPE
        },
        "NPN": $v.NPN,
        "LicenseDetails": {
            "LicenseType": row.LICENSETYPE,
            "LicenseNumber": row.LICENSENUMBER,
            "EffectiveDate": row.EFFECTIVEDATE,
            "ExpirationDate": row.EXPIRATIONDATE,
            "Qualification": row.QUALIFICATION,
            "QualificationEffectiveDate": row.QUALIFICATIONEFFECTIVEDATE
        },
        "Details": {
            "Contact": {
                "HomePhone": row.MAILINGPHONE,
                "BusinessPhone": row.BUSINESSPHONE,
                "Fax": "",
                "MobilePhone": row.MAILINGPHONE,
                "SendSms": false,
                "EmailId": row.BUSINESSEMAILADDRESS,
                "SendQuoteEmail": false,
                "QuoteEmailId": row.BUSINESSEMAILADDRESS,
                "SendPolicyEmail": false,
                "PolicyEmailId": row.BUSINESSEMAILADDRESS,
                "FromEmailId": row.BUSINESSEMAILADDRESS,
                "EmailCCId": row.BUSINESSEMAILADDRESS,
                "PreferedContactType": "E",
                "SecondaryEmailId": row.BUSINESSEMAILADDRESS
            }
        },
        "Address": {
            "IsManual": null,
            "StreetName": $split(row.FIRMBUSINESSADDRESS, '\n')[0],
            "AddressLine1": null,
            "AddressLine2": null,
            "City": "",
            "State": "",
            "County": "",
            "CountyCode": null,
            "Zip": "",
            "Country": "US",
            "CountryCode": "US",
            "PlaceId": null,
            "Number": null,
            "Name": null,
            "Long": null,
            "Lat": null,
            "Description": null,
            "AddressType": "M",
            "FormattedAddress": null,
            "UnFormattedAddress": $replace(row.FIRMBUSINESSADDRESS, '\n', ','),
            "Status": null,
            "AptSuite": null,
            "PoBox": null,
            "CityCode": null,
            "Territory": null,
            "TerritoryCode": null
        }
    }
})
    `; // Example JSONata expression
// transformJsonFromFile(inputFilePath, jsonataExpr, outputFilePath);
export { transformJsonFromFile };
