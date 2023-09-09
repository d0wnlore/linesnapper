import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './popup.css';

const provider = new ethers.JsonRpcProvider('https://sepolia-rpc.scroll.io/');
const abi = ['function retrieve() view returns (uint256)'];
const contract = new ethers.Contract(
  '0x5Be485f97bad2b63E57DBb7d43113065E328C34C',
  abi,
  provider
);

const INITIAL_CONDITIONS = {
  'Domain has a dash (-)': null,
  'Domain uses a suspicious TLD': null,
  'Domain has suspicious keywords': null,
};

function Popup() {
  const [conditions, setConditions] = useState(INITIAL_CONDITIONS);
  const [grade, setGrade] = useState(null);
  const [domain, setDomain] = useState(null);
  const [blockNo, setBlockNo] = useState(null);
  const [contractData, setContractData] = useState(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const domain = new URL(tabs[0].url).hostname
        .split('.')
        .slice(-2)
        .join('.');
      const updatedConditions = getUpdatedConditions(domain);

      const determinedGrade = determineGrade(updatedConditions);
      setConditions(updatedConditions);
      setGrade(determinedGrade);
      setDomain(domain);
      getBlockNo();
      getContractData();
    });
  }, []);

  const determineGradeColor = (grade) => {
    const grades = ['A', 'B', 'C', 'D', 'F'];
    const colors = [
      '#00FF00',
      '#ADFF2F',
      '#FFFF00',
      '#FFA500',
      '#FF0000',
      '#888888',
    ];
    const index = grades.indexOf(grade);
    return colors[Math.min(index, 5)];
  };

  const getUpdatedConditions = (domain) => ({
    ...conditions,
    'Domain has a dash (-)': domain.includes('-'),
    'Domain uses a suspicious TLD': ['.gift'].some((tld) =>
      domain.endsWith(tld)
    ),
    'Domain has suspicious keywords': ['usdc'].some((token) =>
      domain.includes(token)
    ),
  });

  const determineGrade = (updatedConditions) => {
    const negativeConditionsCount =
      Object.values(updatedConditions).filter(Boolean).length;
    const grades = ['A', 'B', 'C', 'D', 'F'];
    return grades[Math.min(negativeConditionsCount, 4)];
  };

  const isPhishingGrade = (grade) => {
    const phishingGrades = ['B', 'C', 'D', 'F'];
    return phishingGrades.includes(grade);
  };

  const getBlockNo = async () => {
    setBlockNo(await provider.getBlockNumber());
  };

  const getContractData = async () => {
    setContractData(await contract.retrieve());
  };

  return (
    <div className="App">
      {grade ? (
        <>
          <h1 style={{ color: determineGradeColor(grade) }}>Grade: {grade}</h1>
          {isPhishingGrade(grade) && (
            <h2 style={{ color: 'red' }}>🎣 Phishing</h2>
          )}
          <p>
            <strong>{domain}</strong>
          </p>
          <p>
            <strong>{blockNo}</strong>
          </p>
          <p>
            <strong>Contract Data: {parseInt(contractData)}</strong>
          </p>
        </>
      ) : (
        <h1>Grade: Not Determined</h1>
      )}
      <p>Final grade based on:</p>
      <ul>
        {Object.entries(conditions).map(([condition, value], index) => (
          <li key={index}>
            {condition}: {value === null ? '❓' : value ? '✅' : '🚫'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Popup;
