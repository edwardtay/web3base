// REPLACE the fetchWalletData function in frontend/index.html (line 1365-1418) with this:

async function fetchWalletData(address) {
    try {
        addMessage('system', '🔄 <strong>Analyzing wallet...</strong><br>Fetching data from Thirdweb, Alchemy, Blockscout, and Moralis...');
        
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
            let message = `📊 <strong>Complete Wallet Analysis</strong><br><br>`;
            
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
                        const chainNames = {1: 'Ethereum', 137: 'Polygon', 56: 'BSC', 42161: 'Arbitrum', 10: 'Optimism'};
                        const chainName = chainNames[chain.chainId] || `Chain ${chain.chainId}`;
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
                        const chainNames = {1: 'Ethereum', 137: 'Polygon', 56: 'BSC'};
                        const chainName = chainNames[collection.chainId] || `Chain ${collection.chainId}`;
                        message += `  • ${collection.count} ${collection.type} on ${chainName}<br>`;
                    });
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
                
                if (bs.balance) {
                    const balance = (parseInt(bs.balance) / 1e18).toFixed(6);
                    message += `💰 <strong>ETH Balance:</strong> ${balance} ETH<br>`;
                }
                
                message += `📝 <strong>Total Transactions:</strong> ${bs.transactionCount || 0}<br>`;
                message += `⛽ <strong>Gas Used:</strong> ${bs.gasUsed || 0}<br>`;
                message += `🏷️ <strong>Tokens:</strong> ${bs.tokenCount || 0}<br>`;
                message += `🖼️ <strong>NFTs:</strong> ${bs.nftCount || 0}<br>`;
                
                if (bs.isContract) {
                    message += `📜 <strong>Type:</strong> Smart Contract ${bs.isVerified ? '✅ Verified' : '⚠️ Unverified'}<br>`;
                }
                
                // Recent transactions
                if (bs.transactions && bs.transactions.length > 0) {
                    message += `<br><strong>📜 Recent Transactions:</strong><br>`;
                    bs.transactions.slice(0, 3).forEach(tx => {
                        const shortHash = tx.hash.slice(0, 10) + '...';
                        const value = tx.value ? (parseInt(tx.value) / 1e18).toFixed(4) : '0';
                        const status = tx.status === 'ok' ? '✅' : '❌';
                        const method = tx.method || 'Transfer';
                        message += `  ${status} <code>${shortHash}</code>: ${value} ETH (${method})<br>`;
                    });
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
            
            message += `<br><span style="font-size: 0.85em; color: #8b949e;">Type "audit my wallet" for AI-powered security analysis</span>`;
            
            addMessage('system', message);
        } else {
            addMessage('system', '⚠️ Unable to fetch complete wallet data. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        addMessage('system', `⚠️ Error analyzing wallet. Type "audit my wallet" for security analysis.`);
    }
}


// UPDATED VERSION with Revoke.cash Security Recommendations
async function fetchWalletDataWithRevoke(address) {
    try {
        addMessage('system', '🔄 <strong>Analyzing wallet...</strong><br>Fetching data from Thirdweb, Alchemy, Blockscout, Moralis, and Revoke.cash...');
        
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
            let message = `📊 <strong>Complete Wallet Analysis</strong><br><br>`;
            
            // Revoke.cash Security (Show first - most important!)
            if (result.revoke && !result.revoke.error) {
                const revoke = result.revoke;
                message += `<strong>🔐 Security Alert - Token Approvals:</strong><br>`;
                message += `<div style="background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); padding: 12px; border-radius: 6px; margin: 10px 0;">`;
                message += `⚠️ <strong>IMPORTANT:</strong> Check your token approvals to prevent fund drainage<br><br>`;
                
                if (revoke.recommendations) {
                    message += `<strong>Critical Actions:</strong><br>`;
                    revoke.recommendations.criticalActions.forEach(action => {
                        const priorityColor = action.priority === 'HIGH' ? '#ff4444' : '#ffaa00';
                        message += `<div style="margin: 8px 0; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;">`;
                        message += `${action.icon} <strong style="color: ${priorityColor};">[${action.priority}]</strong> ${action.action}<br>`;
                        message += `<span style="font-size: 0.9em; color: #8b949e;">${action.description}</span><br>`;
                        message += `<a href="${action.url}" target="_blank" style="color: #00d4ff; text-decoration: underline;">→ Take Action</a>`;
                        message += `</div>`;
                    });
                }
                
                if (revoke.summary) {
                    message += `<br><strong>📋 Approval Summary:</strong><br>`;
                    message += `${revoke.summary.message}<br><br>`;
                    message += `<strong>Recommendations:</strong><br>`;
                    revoke.summary.recommendations.forEach(rec => {
                        message += `  ${rec}<br>`;
                    });
                }
                
                message += `<br><a href="${revoke.recommendations.revokeUrl}" target="_blank" style="display: inline-block; background: #ff4444; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 8px;">🔐 Check Approvals on Revoke.cash →</a>`;
                message += `</div><br>`;
            }
            
            // Thirdweb Portfolio
            if (result.thirdweb && !result.thirdweb.error) {
                const tw = result.thirdweb;
                message += `<strong>💼 Thirdweb Portfolio:</strong><br>`;
                message += `💰 <strong>Total Value:</strong> $${tw.totalValueUSD || '0'}<br>`;
                message += `🏷️ <strong>Token Count:</strong> ${tw.tokenCount || 0}<br>`;
                message += `🖼️ <strong>NFT Count:</strong> ${tw.nftCount || 0}<br>`;
                message += `📊 <strong>Diversity Score:</strong> ${tw.diversityScore || 0}/100<br>`;
                
                if (tw.chainBreakdown && tw.chainBreakdown.length > 0) {
                    message += `<br><strong>⛓️ Multi-Chain Holdings:</strong><br>`;
                    tw.chainBreakdown.forEach(chain => {
                        const chainNames = {1: 'Ethereum', 137: 'Polygon', 56: 'BSC', 42161: 'Arbitrum', 10: 'Optimism'};
                        const chainName = chainNames[chain.chainId] || `Chain ${chain.chainId}`;
                        message += `  • ${chainName}: ${chain.tokens.length} tokens ($${chain.totalValueUSD.toFixed(2)})<br>`;
                    });
                }
                
                if (tw.topTokens && tw.topTokens.length > 0) {
                    message += `<br><strong>💎 Top Token Holdings:</strong><br>`;
                    tw.topTokens.slice(0, 5).forEach(token => {
                        const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
                        const valueUSD = parseFloat(token.balanceUSD || '0');
                        message += `  • ${token.symbol}: ${balance.toFixed(4)} ($${valueUSD.toFixed(2)})<br>`;
                    });
                }
            }
            
            // Alchemy Metrics
            if (result.alchemy && !result.alchemy.error) {
                const alchemy = result.alchemy;
                message += `<br><strong>⚡ Alchemy Metrics:</strong><br>`;
                message += `💰 <strong>ETH Balance:</strong> ${alchemy.ethBalance || '0'} ETH<br>`;
                message += `📝 <strong>Transaction Count:</strong> ${alchemy.transactionCount || 0}<br>`;
                message += `📊 <strong>Activity Score:</strong> ${alchemy.activityScore || 0}/100<br>`;
            }
            
            // Blockscout Data
            if (result.blockscout && !result.blockscout.error) {
                const bs = result.blockscout;
                message += `<br><strong>🔍 Blockscout Data:</strong><br>`;
                message += `📝 <strong>Total Transactions:</strong> ${bs.transactionCount || 0}<br>`;
                message += `⛽ <strong>Gas Used:</strong> ${bs.gasUsed || 0}<br>`;
                message += `🏷️ <strong>Tokens:</strong> ${bs.tokenCount || 0}<br>`;
                message += `🖼️ <strong>NFTs:</strong> ${bs.nftCount || 0}<br>`;
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
            
            message += `<br><span style="font-size: 0.85em; color: #8b949e;">Type "audit my wallet" for AI-powered security analysis</span>`;
            
            addMessage('system', message);
        } else {
            addMessage('system', '⚠️ Unable to fetch complete wallet data. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        addMessage('system', `⚠️ Error analyzing wallet. Type "audit my wallet" for security analysis.`);
    }
}
