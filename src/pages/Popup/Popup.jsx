import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './popup.css';

const provider = new ethers.JsonRpcProvider('https://sepolia-rpc.scroll.io/');
const abi = ['function retrieve() view returns (string)'];
const contract = new ethers.Contract(
  '0x94311760180EEF5A2365Aa36Ee4Bf7cBC6aF8bc6',
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
  const [tldList, setTldList] = useState(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const domain = new URL(tabs[0].url).hostname
        .split('.')
        .slice(-2)
        .join('.');
      setDomain(domain);
      await getTldList();
    });
  }, []);

  useEffect(() => {
    if (tldList && domain) {
      evaluateDomain(domain);
    }
  }, [tldList, domain]);

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

  const evaluateDomain = (domain) => {
    const updatedConditions = getUpdatedConditions(domain);
    const determinedGrade = determineGrade(updatedConditions);
    setConditions(updatedConditions);
    setGrade(determinedGrade);
  };

  const getUpdatedConditions = (domain) => ({
    ...conditions,
    'Domain has a dash (-)': domain.includes('-'),
    'Domain uses a suspicious TLD': tldList.some((tld) => domain.endsWith(tld)),
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

  const getTldList = async () => {
    let tldString = await contract.retrieve();
    setTldList(
      tldString.split(',').map((item) => item.trim().replace(/'/g, ''))
    );
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
            <strong>TLD list: {tldList}</strong>
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
