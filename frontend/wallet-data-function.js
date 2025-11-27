// Fetch wallet data from Moralis and Blockscout
async function fetchWalletData(address) {
    try {
        const response = await fetch(API_BASE_URL + '/api/wallet/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch wallet data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            let message = `📊 <strong>Comprehensive Wallet Analysis</strong><br><br>`;
            
            // Blockscout data
            if (result.blockscout && !result.blockscout.error) {
                const bs = result.blockscout;
                const balance = bs.balance ? (parseInt(bs.balance) / 1e18).toFixed(4) : '0';
                
                message += `<strong>🔍 Blockscout Data:</strong><br>`;
                message += `💰 <strong>ETH Balance:</strong> ${balance} ETH<br>`;
                message += `📝 <strong>Total Transactions:</strong> ${bs.transactionCount || 0}<br>`;
                message += `⛽ <strong>Gas Used:</strong> ${bs.gasUsed || 0}<br>`;
                message += `🏷️ <strong>Token Holdings:</strong> ${bs.tokenCount || 0} tokens<br>`;
                message += `🖼️ <strong>NFTs:</strong> ${bs.nftCount || 0}<br>`;
                message += `🔄 <strong>Token Transfers:</strong> ${bs.tokenTransfersCount || 0}<br>`;
                message += `📥 <strong>Internal Txs:</strong> ${bs.internalTxCount || 0}<br>`;
                
                if (bs.isContract) {
                    message += `📜 <strong>Type:</strong> Smart Contract ${bs.isVerified ? '✅ Verified' : '⚠️ Unverified'}<br>`;
                }
                
                // Show recent transactions
                if (bs.transactions && bs.transactions.length > 0) {
                    message += `<br><strong>📜 Recent Transactions:</strong><br>`;
                    bs.transactions.slice(0, 5).forEach(tx => {
                        const shortHash = tx.hash.slice(0, 10) + '...';
                        const value = tx.value ? (parseInt(tx.value) / 1e18).toFixed(4) : '0';
                        const status = tx.status === 'ok' ? '✅' : '❌';
                        const method = tx.method || 'Transfer';
                        message += `  ${status} <code>${shortHash}</code>: ${value} ETH (${method})<br>`;
                    });
                }
                
                // Show token balances
                if (bs.tokenBalances && bs.tokenBalances.length > 0) {
                    message += `<br><strong>💎 Top Token Holdings:</strong><br>`;
                    bs.tokenBalances.slice(0, 5).forEach(token => {
                        const symbol = token.token?.symbol || 'Unknown';
                        const value = token.value || '0';
                        const decimals = parseInt(token.token?.decimals || '18');
                        const balance = (parseInt(value) / Math.pow(10, decimals)).toFixed(4);
                        message += `  • ${symbol}: ${balance}<br>`;
                    });
                }
                
                // Show NFTs
                if (bs.nfts && bs.nfts.length > 0) {
                    message += `<br><strong>🖼️ NFT Collections:</strong><br>`;
                    const collections = new Set();
                    bs.nfts.forEach(nft => {
                        if (nft.token?.name) collections.add(nft.token.name);
                    });
                    Array.from(collections).slice(0, 5).forEach(name => {
                        message += `  • ${name}<br>`;
                    });
                }
            }
            
            // Moralis data
            if (result.moralis && !result.moralis.error) {
                const moralis = result.moralis;
                message += `<br><strong>🔮 Moralis Analysis:</strong><br>`;
                
                if (moralis.analysis) {
                    const netWorth = moralis.analysis.netWorth ? `$${moralis.analysis.netWorth.toLocaleString()}` : 'N/A';
                    const securityScore = moralis.analysis.securityScore || 100;
                    
                    message += `💰 <strong>Net Worth:</strong> ${netWorth}<br>`;
                    message += `🛡️ <strong>Security Score:</strong> ${securityScore}/100<br>`;
                    
                    if (moralis.analysis.riskFactors && moralis.analysis.riskFactors.length > 0) {
                        message += `<br>⚠️ <strong>Risk Factors:</strong><br>`;
                        moralis.analysis.riskFactors.forEach(risk => {
                            message += `  • ${risk}<br>`;
                        });
                    }
                }
            }
            
            message += `<br><span style="font-size: 0.85em; color: #8b949e;">Type "audit my wallet" for AI-powered security analysis</span>`;
            
            addMessage('system', message);
        } else {
            addMessage('system', '⚠️ Wallet connected but unable to fetch complete data');
        }
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        addMessage('system', `⚠️ Wallet connected. Type "audit my wallet" for security analysis.`);
    }
}

// Updated version with Alchemy integration
async function fetchWalletDataWithAlchemy(address) {
    try {
        const response = await fetch(API_BASE_URL + '/api/wallet/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch wallet data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            let message = `📊 <strong>Comprehensive Wallet Analysis</strong><br><br>`;
            
            // Alchemy Metrics (Primary)
            if (result.alchemy && !result.alchemy.error) {
                const alchemy = result.alchemy;
                message += `<strong>⚡ Alchemy Metrics:</strong><br>`;
                message += `💰 <strong>ETH Balance:</strong> ${alchemy.ethBalance || '0'} ETH<br>`;
                message += `📝 <strong>Transaction Count:</strong> ${alchemy.transactionCount || 0}<br>`;
                message += `🏷️ <strong>Token Count:</strong> ${alchemy.tokenCount || 0}<br>`;
                message += `🖼️ <strong>NFT Count:</strong> ${alchemy.nftCount || 0}<br>`;
                message += `📊 <strong>Activity Score:</strong> ${alchemy.activityScore || 0}/100<br>`;
                
                // Show token holdings with metadata
                if (alchemy.tokens && alchemy.tokens.length > 0) {
                    message += `<br><strong>💎 Token Holdings:</strong><br>`;
                    alchemy.tokens.slice(0, 5).forEach(token => {
                        const symbol = token.metadata?.symbol || 'Unknown';
                        const name = token.metadata?.name || 'Unknown Token';
                        const decimals = token.metadata?.decimals || 18;
                        const balance = token.tokenBalance ? (parseInt(token.tokenBalance, 16) / Math.pow(10, decimals)).toFixed(4) : '0';
                        if (parseFloat(balance) > 0) {
                            message += `  • ${symbol} (${name}): ${balance}<br>`;
                        }
                    });
                }
                
                // Show NFT collections
                if (alchemy.nftCollections && alchemy.nftCollections.length > 0) {
                    message += `<br><strong>🖼️ NFT Collections:</strong><br>`;
                    alchemy.nftCollections.slice(0, 5).forEach(collection => {
                        message += `  • ${collection.name}: ${collection.count} items (${collection.tokenType})<br>`;
                    });
                }
                
                // Show transfer type breakdown
                if (alchemy.transferTypeBreakdown) {
                    message += `<br><strong>🔄 Recent Activity Breakdown:</strong><br>`;
                    Object.entries(alchemy.transferTypeBreakdown).forEach(([type, count]) => {
                        message += `  • ${type}: ${count}<br>`;
                    });
                }
            }
            
            // Blockscout data
            if (result.blockscout && !result.blockscout.error) {
                const bs = result.blockscout;
                message += `<br><strong>🔍 Blockscout Data:</strong><br>`;
                message += `📝 <strong>Total Transactions:</strong> ${bs.transactionCount || 0}<br>`;
                message += `⛽ <strong>Gas Used:</strong> ${bs.gasUsed || 0}<br>`;
                message += `🔄 <strong>Token Transfers:</strong> ${bs.tokenTransfersCount || 0}<br>`;
                message += `📥 <strong>Internal Txs:</strong> ${bs.internalTxCount || 0}<br>`;
                
                if (bs.isContract) {
                    message += `📜 <strong>Type:</strong> Smart Contract ${bs.isVerified ? '✅ Verified' : '⚠️ Unverified'}<br>`;
                }
            }
            
            // Moralis data
            if (result.moralis && !result.moralis.error && result.moralis.analysis) {
                const moralis = result.moralis;
                message += `<br><strong>🔮 Moralis Security:</strong><br>`;
                
                const netWorth = moralis.analysis.netWorth ? `$${moralis.analysis.netWorth.toLocaleString()}` : 'N/A';
                const securityScore = moralis.analysis.securityScore || 100;
                
                message += `💰 <strong>Net Worth:</strong> ${netWorth}<br>`;
                message += `🛡️ <strong>Security Score:</strong> ${securityScore}/100<br>`;
                
                if (moralis.analysis.riskFactors && moralis.analysis.riskFactors.length > 0) {
                    message += `<br>⚠️ <strong>Risk Factors:</strong><br>`;
                    moralis.analysis.riskFactors.forEach(risk => {
                        message += `  • ${risk}<br>`;
                    });
                }
            }
            
            message += `<br><span style="font-size: 0.85em; color: #8b949e;">Type "audit my wallet" for comprehensive AI-powered security analysis</span>`;
            
            addMessage('system', message);
        } else {
            addMessage('system', '⚠️ Wallet connected but unable to fetch complete data');
        }
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        addMessage('system', `⚠️ Wallet connected. Type "audit my wallet" for security analysis.`);
    }
}


// Complete version with all 4 integrations (Moralis, Blockscout, Alchemy, Thirdweb)
async function fetchCompleteWalletData(address) {
    try {
        const response = await fetch(API_BASE_URL + '/api/wallet/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch wallet data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            let message = `📊 <strong>Comprehensive Wallet Analysis</strong><br><br>`;
            
            // Thirdweb Portfolio (Primary - Most comprehensive)
            if (result.thirdweb && !result.thirdweb.error) {
                const tw = result.thirdweb;
                message += `<strong>💼 Thirdweb Portfolio:</strong><br>`;
                message += `💰 <strong>Total Value:</strong> $${tw.totalValueUSD || '0'}<br>`;
                message += `🏷️ <strong>Token Count:</strong> ${tw.tokenCount || 0}<br>`;
                message += `🖼️ <strong>NFT Count:</strong> ${tw.nftCount || 0}<br>`;
                message += `📊 <strong>Diversity Score:</strong> ${tw.diversityScore || 0}/100<br>`;
                
                // Chain breakdown
                if (tw.chainBreakdown && tw.chainBreakdown.length > 0) {
                    message += `<br><strong>⛓️ Multi-Chain Holdings:</strong><br>`;
                    tw.chainBreakdown.forEach(chain => {
                        const chainName = getChainName(chain.chainId);
                        message += `  • ${chainName}: ${chain.tokens.length} tokens ($${chain.totalValueUSD.toFixed(2)})<br>`;
                    });
                }
                
                // Top tokens by value
                if (tw.topTokens && tw.topTokens.length > 0) {
                    message += `<br><strong>💎 Top Token Holdings:</strong><br>`;
                    tw.topTokens.slice(0, 5).forEach(token => {
                        const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
                        const valueUSD = parseFloat(token.balanceUSD || '0');
                        message += `  • ${token.symbol}: ${balance.toFixed(4)} ($${valueUSD.toFixed(2)})<br>`;
                    });
                }
                
                // Token type breakdown
                if (tw.tokenTypeBreakdown) {
                    message += `<br><strong>📈 Token Distribution:</strong><br>`;
                    message += `  • Native: ${tw.tokenTypeBreakdown.native.count} tokens ($${tw.tokenTypeBreakdown.native.totalValueUSD})<br>`;
                    message += `  • ERC-20: ${tw.tokenTypeBreakdown.erc20.count} tokens ($${tw.tokenTypeBreakdown.erc20.totalValueUSD})<br>`;
                }
                
                // NFT collections
                if (tw.nftCollections && tw.nftCollections.length > 0) {
                    message += `<br><strong>🖼️ NFT Collections:</strong><br>`;
                    tw.nftCollections.slice(0, 5).forEach(collection => {
                        const chainName = getChainName(collection.chainId);
                        message += `  • ${collection.count} ${collection.type} on ${chainName}<br>`;
                    });
                }
                
                // NFT type breakdown
                if (tw.nftTypeBreakdown) {
                    message += `<br><strong>🎨 NFT Types:</strong><br>`;
                    message += `  • ERC-721: ${tw.nftTypeBreakdown.ERC721}<br>`;
                    message += `  • ERC-1155: ${tw.nftTypeBreakdown.ERC1155}<br>`;
                }
            }
            
            // Alchemy Metrics
            if (result.alchemy && !result.alchemy.error) {
                const alchemy = result.alchemy;
                message += `<br><strong>⚡ Alchemy Metrics:</strong><br>`;
                message += `💰 <strong>ETH Balance:</strong> ${alchemy.ethBalance || '0'} ETH<br>`;
                message += `📝 <strong>Transaction Count:</strong> ${alchemy.transactionCount || 0}<br>`;
                message += `📊 <strong>Activity Score:</strong> ${alchemy.activityScore || 0}/100<br>`;
                
                // Transfer breakdown
                if (alchemy.transferTypeBreakdown) {
                    message += `<br><strong>🔄 Recent Activity:</strong><br>`;
                    Object.entries(alchemy.transferTypeBreakdown).forEach(([type, count]) => {
                        message += `  • ${type}: ${count}<br>`;
                    });
                }
            }
            
            // Blockscout Data
            if (result.blockscout && !result.blockscout.error) {
                const bs = result.blockscout;
                message += `<br><strong>🔍 Blockscout Data:</strong><br>`;
                message += `📝 <strong>Total Transactions:</strong> ${bs.transactionCount || 0}<br>`;
                message += `⛽ <strong>Gas Used:</strong> ${bs.gasUsed || 0}<br>`;
                
                if (bs.isContract) {
                    message += `📜 <strong>Type:</strong> Smart Contract ${bs.isVerified ? '✅ Verified' : '⚠️ Unverified'}<br>`;
                }
            }
            
            // Moralis Security
            if (result.moralis && !result.moralis.error && result.moralis.analysis) {
                const moralis = result.moralis;
                message += `<br><strong>🔮 Moralis Security:</strong><br>`;
                
                const netWorth = moralis.analysis.netWorth ? `$${moralis.analysis.netWorth.toLocaleString()}` : 'N/A';
                const securityScore = moralis.analysis.securityScore || 100;
                
                message += `💰 <strong>Net Worth:</strong> ${netWorth}<br>`;
                message += `🛡️ <strong>Security Score:</strong> ${securityScore}/100<br>`;
                
                if (moralis.analysis.riskFactors && moralis.analysis.riskFactors.length > 0) {
                    message += `<br>⚠️ <strong>Risk Factors:</strong><br>`;
                    moralis.analysis.riskFactors.forEach(risk => {
                        message += `  • ${risk}<br>`;
                    });
                }
            }
            
            message += `<br><span style="font-size: 0.85em; color: #8b949e;">Type "audit my wallet" for comprehensive AI-powered security analysis</span>`;
            
            addMessage('system', message);
        } else {
            addMessage('system', '⚠️ Wallet connected but unable to fetch complete data');
        }
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        addMessage('system', `⚠️ Wallet connected. Type "audit my wallet" for security analysis.`);
    }
}

// Helper function to get chain name from chain ID
function getChainName(chainId) {
    const chains = {
        1: 'Ethereum',
        137: 'Polygon',
        56: 'BSC',
        42161: 'Arbitrum',
        10: 'Optimism',
        43114: 'Avalanche',
        250: 'Fantom',
        8453: 'Base',
    };
    return chains[chainId] || `Chain ${chainId}`;
}
