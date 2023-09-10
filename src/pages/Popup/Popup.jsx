import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './Popup.css';

const scrollProvider = new ethers.JsonRpcProvider(
  'https://sepolia-rpc.scroll.io/'
);
const zkSyncProvider = new ethers.JsonRpcProvider(
  'https://testnet.era.zksync.dev'
);
const abi = ['function retrieve() view returns (string)'];
const scrollContract = new ethers.Contract(
  '0x94311760180EEF5A2365Aa36Ee4Bf7cBC6aF8bc6',
  abi,
  scrollProvider
);
const zkSyncContract = new ethers.Contract(
  '0x1093A313F81141CB1ABF6B4E73f2C4B683167976',
  abi,
  zkSyncProvider
);

const INITIAL_CONDITIONS = {
  'Not using a dash (-)': null,
  'Not using suspicious keywords or TLD': null,
};

function Popup() {
  const [conditions, setConditions] = useState(INITIAL_CONDITIONS);
  const [grade, setGrade] = useState(null);
  const [hostname, setHostname] = useState(null);
  const [domain, setDomain] = useState(null);
  const [keywordList, setKeywordList] = useState(null);
  const [chain, setChain] = useState(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const hostname = new URL(tabs[0].url).hostname;
      const domain = hostname.split('.').slice(-2).join('.');
      setHostname(hostname);
      setDomain(domain);
      await chrome.storage.sync.get(['option'], (result) => {
        if (result.option === 'scroll') {
          setChain('Scroll');
          getScrollKeywordList();
        } else {
          setChain('zkSync Era');
          getZkSyncKeywordList();
        }
      });
    });
  }, []);

  useEffect(() => {
    if (keywordList && domain) {
      evaluateDomain(domain);
    }
  }, [keywordList, domain]);

  const determineGradeColor = (grade) => {
    const grades = ['🟢', '🟡', '🔴'];
    const colors = ['#00FF00', '#FFFF00', '#FF0000', '#888888'];
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
    'Not using a dash (-)': domain.includes('-'),
    'Not using suspicious keywords or TLD': keywordList.some((keyword) =>
      hostname.includes(keyword)
    ),
  });

  const determineGrade = (updatedConditions) => {
    const negativeConditionsCount =
      Object.values(updatedConditions).filter(Boolean).length;
    const grades = ['🟢', '🟡', '🔴'];
    return grades[Math.min(negativeConditionsCount, 4)];
  };

  const isPhishingGrade = (grade) => {
    const phishingGrades = ['🟡', '🔴'];
    return phishingGrades.includes(grade);
  };

  const getScrollKeywordList = async () => {
    let keywordString = await scrollContract.retrieve();
    setKeywordList(
      keywordString.split(', ').map((item) => item.replace(/'/g, ''))
    );
  };

  const getZkSyncKeywordList = async () => {
    let keywordString = await zkSyncContract.retrieve();
    setKeywordList(
      keywordString.split(', ').map((item) => item.replace(/'/g, ''))
    );
  };

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="App">
      {grade ? (
        <>
          <h1 style={{ color: determineGradeColor(grade) }}>Grade {grade}</h1>
          {isPhishingGrade(grade) && (
            <h3 style={{ color: 'red' }}>🎣 {domain} is phishing</h3>
          )}
        </>
      ) : (
        <h1>Loading ⏳</h1>
      )}
      <p>Final grade based on domain:</p>
      <ul>
        {Object.entries(conditions).map(([condition, value], index) => (
          <li key={index}>
            {value === null ? '⏳' : value ? '🚫' : '✅'} {condition}
          </li>
        ))}
      </ul>
      <p>
        Using ruleset from <strong>{chain}</strong> (
        <a style={{ color: 'white' }} href="#" onClick={openOptionsPage}>
          change
        </a>
        )
      </p>
    </div>
  );
}

export default Popup;
